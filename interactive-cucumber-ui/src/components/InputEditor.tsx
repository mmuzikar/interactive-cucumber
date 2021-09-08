import Editor, { OnMount } from "@monaco-editor/react";
import { CancellationToken, editor, languages, Position, Range } from "monaco-editor";
import { useContext, useRef } from "react";
import { useAlert } from "react-alert";
import { useEffectOnce } from "react-use";
import { CucumberContext } from "../data/CucumberContext";
import { initServices, ServiceManager } from "../services/Service";


const INPUT_LANG_ID = "feature"
export const STEP_PATTERN = /(?:Given|When|Then|And|But)\s(.*)/;

const DEFAULT_TEXT = `
# Here's where the magic happens
Feature: My awesome feature
    Scenario: The easiest scenario I've ever written
        When I type stuff
        Then stuff happens right in front of my eyes!
`.trim()


export const InputEditor = () => {

    const cucumber = useContext(CucumberContext)
    const alert = useAlert()

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

    useEffectOnce(() => {
        initServices(alert, cucumber)
    })

    const editorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor

        monaco.languages.register({ id: INPUT_LANG_ID })
        monaco.languages.setMonarchTokensProvider(INPUT_LANG_ID, {
            defaultToken: 'invalid',
            symbols: ['"', "'"],
            tokenizer: {
                root: [
                    [/#.*$/, 'comment'],
                    [/@[\w-]*/, 'annotation'],
                    [/(?:Feature|Scenario|Background):/, 'keyword', '@description'],
                    [/(?:Then|When|And|Given|But)/, 'keyword', '@step'],
                    [/\|/, 'delimiter', '@table'],
                    [/"""/, 'string', '@multilineString']
                ],
                description: [
                    [/.*/, 'identifier', '@pop']
                ],
                table: [
                    [/[^|]/, 'string.table'],
                    [/\|\s*$/, 'delimiter', '@pop'],
                    [/\|/, 'delimiter'],
                ],
                step: [
                    [/"[^"]*"$/, 'string', '@pop'],
                    [/\S$/, 'identifier', '@pop'],
                    [/\s$/, 'whitespace', '@pop'],
                    [/"[^"]*"/, 'string'],
                    [/\S/, 'identifier'],
                    [/\s/, 'whitespace']
                ],
                multilineString: [
                    [/.*"""/, 'string', '@pop'],
                    [/.*$/, 'string'],
                ]
            }
        })

        const removeBackgroundCommandId = editor.addCommand(0, (ctx, model: editor.ITextModel, lineNum: number) => {
            const startLineNum = lineNum
            while (!(/Scenario: .*/.test(model.getLineContent(lineNum)))) {
                console.log(`${model.getLineContent(lineNum)} did not match`)
                lineNum++
            }
            model.applyEdits([
                {
                    range: { startLineNumber: startLineNum, endLineNumber: lineNum, startColumn: 0, endColumn: 0 },
                    text: ''
                }
            ])
        }, undefined)!

        const runScenario = editor.addCommand(0, (ctx, model: editor.ITextModel, lineNum: number) => {
            // is there line above the scenario
            // if (lineNum - 1 >= 1) {
            //     while(model.getLineContent(lineNum - 1).match(/@.*/)) {
            //         model.applyEdits([
            //             {
            //                 range: new Range(lineNum -1, 0, lineNum, -1),
            //                 text: ''
            //             }
            //         ])
            //         lineNum--
            //         if (lineNum === 1){
            //             break
            //         }
            //     }
            // }
            // model.applyEdits([
            //     {
            //         range: new Range(lineNum, 0, lineNum + 1, -1),
            //         text: ''
            //     }
            // ])
            //Handle body
            while (model.getLineContent(lineNum)) {
                if (model.getLineContent(lineNum).trim().length === 0) {
                    model.applyEdits([
                        {
                            range: new Range(lineNum, 0, lineNum + 1, -1),
                            text: ''
                        }
                    ])
                    continue
                }
                if (ServiceManager.canHandle(model, lineNum)) {
                    ServiceManager.execute(model, lineNum)
                } else {
                    break
                }
            }
        }, undefined)!

        monaco.languages.registerCodeLensProvider(INPUT_LANG_ID, {
            provideCodeLenses: (model: editor.ITextModel, token: CancellationToken) => {
                let lenses: languages.CodeLens[] = []
                const backgroundMatches = model.findMatches('Background:.*', true, true, false, ' ', false)
                lenses.push(...backgroundMatches.map(match => ({
                    range: match.range,
                    command: {
                        id: removeBackgroundCommandId,
                        title: 'Remove background',
                        tooltip: 'Removes the background section',
                        arguments: [model, match.range.startLineNumber]
                    },
                    id: 'remove-background'
                })))
                const scenarioMatches = model.findMatches('Scenario:.*', true, true, false, ' ', false)
                lenses.push(...scenarioMatches.map(match => ({
                    range: match.range,
                    command: {
                        id: runScenario,
                        title: 'Run Scenario',
                        arguments: [model, match.range.startLineNumber]
                    },
                    id: 'run-scenario'
                })))
                return {
                    lenses: lenses,
                    dispose: () => { }
                }
            }
        })

        monaco.languages.registerCompletionItemProvider(INPUT_LANG_ID, {
            async provideCompletionItems(model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken) {
                const line = model.getLineContent(position.lineNumber);

                const word = model.getWordUntilPosition(position);

                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                const stepRegex = STEP_PATTERN.exec(line);
                if (stepRegex) {
                    let sugs = cucumber.stepDefs.map(step => ({
                        insertText: step.asSnippetPattern(),
                        range: range,
                        label: step.getPatternWithoutControlChars(),
                        documentation: step.docs,
                        detail: step.docs ? 'Method documentation' : undefined,
                        kind: languages.CompletionItemKind.Method,
                        insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet
                    })) as languages.CompletionItem[]

                    const closestSteps = cucumber.findSteps(stepRegex[1])
                    console.group('closest steps')
                    console.debug(closestSteps)
                    console.groupEnd()
                    if (closestSteps.length > 0 && closestSteps[0].score && closestSteps[0].score > 0.1) {
                        const suggestionPromise = closestSteps[0].item.provideSuggestions(stepRegex[1])
                        const suggestionsForArgs = await suggestionPromise
                        //If suggestions returned something then suggestions should be shown
                        if (suggestionsForArgs.length > 0) {
                            //Take suggestion for each arg and create completion items from them and flatten them to one list
                            const sugs: languages.CompletionItem[] = suggestionsForArgs.map(suggestions => suggestions.val.map(val => ({
                                insertText: val,
                                kind: languages.CompletionItemKind.Value,
                                label: `Arg #${suggestions.id}: ${val}`,
                                range: range,
                            }))).flat()
                            return {
                                suggestions: sugs
                            }
                        }
                    }
                    return { suggestions: sugs }
                }

                if (line.startsWith('Feature:')) {
                    console.log(line)
                    return { suggestions: cucumber.features.map(feat => ({ insertText: feat.name, range: range, label: feat.name, kind: languages.CompletionItemKind.Constant } as languages.CompletionItem)) }
                } else if (line.startsWith('Scenario')) {
                    return { suggestions: cucumber.features.flatMap(feat => feat.scenarios?.map(s => ({ insertText: `${s.name}\nFeature: ${feat.name}`, range: range, label: s.name, kind: languages.CompletionItemKind.Constant } as languages.CompletionItem))!) }
                }

                const keywords = ["When", "Then", "Given", "And", "But", "Scenario: ", "Feature: "].map(word => ({
                    range: range,
                    label: word,
                    insertText: word,
                    kind: languages.CompletionItemKind.Keyword
                })) as languages.CompletionItem[];
                return {
                    suggestions: keywords
                }
            }
        })

        editor.addAction({
            contextMenuGroupId: INPUT_LANG_ID,
            id: 'feature-run-step',
            label: 'Run Cucumber Step',
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
            ],
            run: (e) => {
                const selection = e.getSelection()
                const model = e.getModel()
                if (model && selection) {
                    ServiceManager.execute(model, selection.startLineNumber)
                }
            }
        })
    }

    const setContent = (text: string) => {
        editorRef?.current?.setValue(text)
    }

    cucumber.setEditorContent = setContent

    return (
        <Editor height="100%"
            onMount={editorDidMount}
            defaultLanguage={INPUT_LANG_ID}
            defaultValue={DEFAULT_TEXT}
        />
    )

}