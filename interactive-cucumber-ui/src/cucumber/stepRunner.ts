import * as vscode from 'vscode'
import { runAsync } from '../utils'
import { InteractiveFeature } from './interactiveFeatureFile'
import { outputFeatureFile } from '../features/filesystem'
import { getCucumberLangClient } from '../features/lsp'

const STEP_PATTERN = /(?:Given|When|Then|And|But)\s(.*)/

//TODO: add settings for Cucumber
export let showModal = false

export const outputFeature = new InteractiveFeature()

outputFeature.listen(() => {
    outputFeatureFile.write(outputFeature.toString())
})

export async function runStep() {
    const editor = vscode.window.activeTextEditor
    if (editor) {
        const { document } = editor
        const lineNum = editor.selection.start.line
        const line = document.lineAt(lineNum)
        let lineText = line.text
        if (tryRunStep(lineNum, document, editor)) {
            return
        }
        if (trySetNames(lineText, lineNum, editor)) {
            return
        }

    }
}

function trySetNames(line: string, lineNum: number, editor: vscode.TextEditor) {
    const match = /(Scenario|Feature):\s+(.*)/.exec(line)
    if (match) {
        if (match[1] === 'Scenario') {
            outputFeature.setScenario(match[2])
        } else {
            outputFeature.setFeature(match[2])
        }
        editor.edit(editBuilder => {
            editBuilder.delete(new vscode.Range(new vscode.Position(lineNum, 0), new vscode.Position(lineNum, line.length)))
        })
        return true
    }
    return false
}

function tryRunStep(lineNum: number, document: vscode.TextDocument, editor: vscode.TextEditor) {
    let line = document.lineAt(lineNum).text
    let range = document.lineAt(lineNum).range
    if (!line.match(STEP_PATTERN) && lineNum > 0) {
        for (let i = lineNum; i >= 0; i--) {
            if (document.lineAt(i).text.match(STEP_PATTERN)) {
                lineNum = i
                line = document.lineAt(lineNum).text
                range = document.lineAt(lineNum).range
            }
        }
    }

    if (line.match(STEP_PATTERN)) {
        let step = line
        if (lineNum + 1 < document.lineCount) {
            let i = lineNum + 1
            let endingLine
            for (; i < document.lineCount; i++) {
                const nextLine = document.lineAt(i)
                if (endingLine) {
                    step += '\n' + nextLine.text
                    if (nextLine.text === endingLine) {
                        if (!endingLine.startsWith('|')) {
                            //Delete also the last quotes for docstrings
                            i++
                        }
                        break
                    }
                } else {
                    if (nextLine.text.match(/(?:\|)|(?:["']{3})/)) {
                        step += '\n' + nextLine.text
                        endingLine = nextLine.text
                    } else {
                        break
                    }
                }
            }
            range = new vscode.Range(range.start, new vscode.Position(i, 0))
        }
        executeStep(editor, range, step)

        return true
    }
    return false
}

function executeStep(editor: vscode.TextEditor, range: vscode.Range, step: string) {
    editor.edit(editBuilder => {
        editBuilder.delete(range)
    })
    runAsync(async () => {
        const setStepResult = outputFeature.addStep(step)
        const response = await getCucumberLangClient().languageClient?.sendRequest('cucumber/runStep', { step }) as any
        setStepResult(response)
        if (response != null) {
            vscode.window.showErrorMessage(response, { modal: showModal })
        }
    })
}

