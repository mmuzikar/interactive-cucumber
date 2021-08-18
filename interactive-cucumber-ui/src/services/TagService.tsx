import { editor, Range } from "monaco-editor";
import { CucumberContextType } from "../data/CucumberContext";
import { Service } from "./Service";

export class TagService implements Service {

    cucumber: CucumberContextType;

    constructor(cucumber: CucumberContextType) {
        this.cucumber = cucumber
    }

    canHandle(model: editor.ITextModel, lineNum: number): boolean {
        return /@[^\s]+/g.test(model.getLineContent(lineNum))
    }

    execute(model: editor.ITextModel, lineNum: number): void {
        const line = model.getLineContent(lineNum).trim()
        const match = line.match(/@[^\s]+/g)
        match?.forEach((tag) => this.cucumber.currentScenario.addTag(tag))
        model.applyEdits([
            {
                range: new Range(lineNum, 0, lineNum + 1, -1),
                text: ''
            }
        ])
    }

}