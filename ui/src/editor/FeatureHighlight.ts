import * as monaco from "monaco-editor";
import { languages, editor } from "monaco-editor"
import { StepManager } from "../interop/stepManager";
import { ID } from "./CommonFeatures";

export function register(){
    languages.register({id: ID});
    registerLexer();
    registerProvider();
}

function registerLexer(){
    languages.setMonarchTokensProvider(ID, {
        defaultToken: 'invalid',
        symbols: ['"', "'"],
        tokenizer: {
            root: [
                [/#.*$/, 'comment'],
                [/@[\w\-]*/, 'annotation'],
                [/(?:Feature|Scenario|Background):/, 'keyword', '@description'],
                [/(?:Then|When|And|Given|But)/, 'keyword', '@step'],
                [/\|/, 'delimiter', '@table'],
                [/"""/, 'string', '@multilineString']
            ],
            description: [
                [/.*/, 'identifier', '@pop']
            ], 
            table: [
                [/[^\|]/, 'string.table'],
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
    } as any);
}

function registerProvider(){
    languages.registerCompletionItemProvider(ID, {
        async provideCompletionItems(model: editor.ITextModel, position: monaco.Position, context: monaco.languages.CompletionContext, token: monaco.CancellationToken){
            const steps = await StepManager.get().getSteps();
            const word = model.getWordUntilPosition(position);
            const range : monaco.IRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            }
            const suggestions: monaco.languages.CompletionList = {
                suggestions: [
                    ...steps.map((step) => ({
                        label: step.pattern.source,
                        kind: languages.CompletionItemKind.Function,
                        insertText: step.getPlaceholderText(),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                    }))
                ]
            }
            return suggestions;
        }
    })
}


