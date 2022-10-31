import { editor } from "monaco-editor";
import { AlertManager } from "react-alert";
import { CucumberContextType } from "../data/CucumberContext";
import { fetchAPI, postApi } from "../utils/Utils";
import { Service } from "./Service";


export class RunScriptService implements Service {
    alert: AlertManager
    cucumber: CucumberContextType

    constructor(alert: AlertManager, cucumber: CucumberContextType) {
        this.alert = alert
        this.cucumber = cucumber
    }

    
    canHandle(model: editor.ITextModel, lineNum: number): boolean {
        return true
    }
    
    execute(model: editor.ITextModel, lineNum: number, command?: string | undefined): void {
        const line = model.getLineContent(lineNum)

        postApi('runscript', line).then(resp => resp.text()).then(val => model.applyEdits([
            {
                range: {startLineNumber: lineNum, endLineNumber: lineNum, startColumn: 1, endColumn: line.length + 1},
                text: `\`${line}\` -> ${val}`
            }
        ]))
    }
    
}