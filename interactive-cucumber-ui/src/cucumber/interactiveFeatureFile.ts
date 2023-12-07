import { uid } from "uid"


export interface StepResult {
    step: string,
    result: 'running' | 'passed' | 'failed',
    error?: string,
    id: string
}

export class InteractiveFeature {

    scenario?: string
    feature?: string
    steps: StepResult[] = []

    private listeners: (() => void)[] = []

    setFeature(name: string) {
        this.feature = name
        this.notify()
    }

    setScenario(name: string) {
        this.scenario = name
        this.notify()
    }

    listen(callback: () => void) {
        this.listeners.push(callback)
    }

    notify() {
        this.listeners.forEach(it => it())
    }

    addStep(step: string): (result?: string) => void {
        const result: StepResult = { step, result: 'running', id: uid() }
        this.steps.push(result)
        this.notify()


        return (error) => {
            if (error) {
                result.result = 'failed'
                result.error = error
            } else {
                result.result = 'passed'
            }
            this.notify()
        }
    }

    removeStep(id: string) {
        this.steps = this.steps.filter(it => it.id != id)
        this.notify()
    }

    

    toString(includeFailures: boolean = true): string {
        let source = ''
        const addLine = (line: string) => {
            source += '\t'.repeat(tabIndex) + line + '\n'
        }

        let tabIndex = 0
        if (this.feature) {
            addLine(`Feature: ${this.feature}`)
            tabIndex++
        }
        if (this.scenario) {
            addLine(`Scenario: ${this.scenario}`)
            tabIndex++
        }
        this.steps.forEach(s => {
            if (s.result === 'failed' && !includeFailures) {
                return
            }
            addLine(s.step)
        })


        return source
    }

    toHtml(includeFailures: boolean = true): string {
        let source = ''
        const addLine = (line: string) => {
            source += line + '\n'
        }

        let tabIndex = 0
        if (this.feature) {
            addLine(`<h3 class="feature-heading">Feature: ${this.feature}</h3>`)
            tabIndex++
        }
        if (this.scenario) {
            addLine(`<h4 class="scenario-heading" style="margin-left: ${tabIndex * 8}px">Scenario: ${this.scenario}</h4>`)
            tabIndex++
        }
        addLine(`<ul class="steps-output">`)

        this.steps.forEach(s => {
            if (s.result === 'failed' && !includeFailures) {
                return
            }
            addLine(`<li class="output-step-${s.result}">${s.step}</li>`)
        })
        addLine(`</ul>`)

        return source
    }
}