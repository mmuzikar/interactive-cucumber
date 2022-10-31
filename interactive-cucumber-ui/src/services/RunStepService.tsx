import { editor, Range } from "monaco-editor";
import { AlertManager } from "react-alert";
import { STEP_PATTERN } from "../components/InputEditor";
import { CucumberContextType } from "../data/CucumberContext";
import { Service } from "./Service";

export class RunStepService implements Service {
    alert: AlertManager
    cucumber: CucumberContextType

    constructor(alert: AlertManager, cucumber: CucumberContextType) {
        this.alert = alert
        this.cucumber = cucumber
    }

    canHandle(model: editor.ITextModel, lineNum: number): boolean {
        return STEP_PATTERN.test(model.getLineContent(lineNum))
    }

    execute(model: editor.ITextModel, lineNum: number, command?: string): void {
        const line = model.getLineContent(lineNum)
        const keyword = line.trim().split(/\s/)[0]
        const stepText = STEP_PATTERN.exec(line)
        if (stepText) {
            let stepValue = stepText[1]
            let i = lineNum + 1
            const lineCount = model.getLineCount()
            while (i <= lineCount) {
                const line = model.getLineContent(i).trim()
                if (line.startsWith("#")) {
                    continue;
                } else if (line.startsWith("'''") || line.startsWith('"""')) {
                    //handle docstring
                    const quotes = line
                    stepValue += '\n' + quotes
                    //consume starting quotes
                    i++
                    while (i <= lineCount && !model.getLineContent(i).trim().startsWith(quotes)) {
                        stepValue += '\n' + model.getLineContent(i)
                        i++
                    }
                    //consume ending quotes
                    i++
                    stepValue += '\n' + quotes
                } else if (line.startsWith('|')) {
                    while (i <= lineCount && model.getLineContent(i).trim().startsWith('|')) {
                        stepValue += '\n' + model.getLineContent(i).trim()
                        i++;
                    }
                }
                break
            }
            const wholeStep = keyword + ' ' + stepValue
            if (command && command === 'background') {
                const resolve = this.cucumber.currentScenario.addBackgroundStep({ text: wholeStep, status: 'scheduled' })
                this.cucumber.enqueueStep(stepValue, resolve)
                model.applyEdits([
                    {
                        range: new Range(lineNum, 0, i, -1),
                        text: ""
                    }
                ])
            } else {
                const resolve = this.cucumber.currentScenario.addStep({ text: wholeStep, status: 'scheduled' })
                this.cucumber.enqueueStep(stepValue, resolve)
                model.applyEdits([
                    {
                        range: new Range(lineNum, 0, i, -1),
                        text: ""
                    }
                ])
            }
        } else {
            this.alert.error(`'${model.getLineContent(lineNum)}' is not a valid step`)
        }
    }

}