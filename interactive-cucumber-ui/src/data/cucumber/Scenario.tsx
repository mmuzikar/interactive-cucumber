import * as messages from "@cucumber/messages";

export class Scenario {
    name: string
    tags: string[]

    steps: readonly messages.Step[]
    background?: messages.Background

    constructor(scenario: messages.Scenario, background?: messages.Background) {
        this.name = scenario.name
        this.tags = scenario.tags.map(tag => tag.name)
        this.steps = scenario.steps
        this.background = background
    }

    private stepsToText(steps: readonly messages.Step[]): string {
        return steps.map(step => {
            let text = '\t' + step.keyword + step.text
            if (step.dataTable) {
                text += '\n' + step.dataTable.rows.map(val => val.cells.map(cell => cell.value).join(" | ")).map((s: string) => '\t| ' + s + ' |').join('\n')
            } else if (step.docString) {
                text += `\n${step.docString.delimiter}\n${step.docString.content}\n${step.docString.delimiter}`
            }
            return text
        }).join('\n')
    }

    getScenarioText(): string {
        const steps = this.stepsToText(this.steps)


        let tags = (this.tags && this.tags.length > 0) ? this.tags.join('\n') + '\n' : null

        let ret = `Scenario: ${this.name}\n${steps}`
        if (tags) {
            ret = tags + ret
        }
        if (this.background) {
            const background = this.background.keyword + ": " + this.background.name + "\n" + this.stepsToText(this.background.steps) + '\n\n'
            ret = background + ret
        }

        return ret
    }
}