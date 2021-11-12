import { editor, Range } from "monaco-editor";
import { CucumberContextType } from "../data/CucumberContext";
import { Service } from "./Service";

export class NamingService implements Service {
    cucumber: CucumberContextType;

    NAMING_PATTERN = /(Scenario|Feature|Background):\s(.*)/

    constructor(cucumber: CucumberContextType) {
        this.cucumber = cucumber
    }

    canHandle(model: editor.ITextModel, lineNum: number): boolean {
        return this.NAMING_PATTERN.test(model.getLineContent(lineNum))
    }

    execute(model: editor.ITextModel, lineNum: number): void {
        const match = this.NAMING_PATTERN.exec(model.getLineContent(lineNum))
        if (match) {
            const [_, type, value] = match
            if (type === 'Scenario') {
                this.cucumber.currentScenario.name = value
            } else if (type === 'Feature') {
                this.cucumber.currentScenario.featureName = value
            } else if (type === 'Background') {
                this.cucumber.currentScenario.background.name = value
            }
            model.applyEdits([{
                range: new Range(lineNum, 0, lineNum + 1, -1),
                text: ''
            }])
        }
    }

}