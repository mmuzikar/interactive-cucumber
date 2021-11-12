export type StepStatus = { text: string, status: 'running' | 'failed' | 'passed' | 'scheduled' }


export class EditableScenario {

    featureId?: string
    _feature?: string
    _name?: string
    _steps: StepStatus[] = []
    _tags: string[] = []

    background: {
        name: string,
        steps: StepStatus[]
    } = { name: "", steps: [] }

    observers: (() => void)[] = []

    update() {
        this.observers.forEach(callback => callback())
    }

    public set name(name: string | undefined) {
        this._name = name
        this.update()
    }

    public get name() {
        return this._name
    }

    public set featureName(name: string | undefined) {
        this._feature = name
        this.update()
    }

    public get featureName(): string | undefined {
        return this._feature
    }

    public get steps() {
        return this._steps
    }

    public hasBackground(): boolean {
        return this.background.name.length > 0 || this.background.steps.length > 0
    }

    public setBackgroundName(text: string) {
        if (!this.background) {
            this.background = { name: text, steps: [] }
        } else {
            this.background.name = text
        }
        this.update()
    }

    public addBackgroundStep(step: StepStatus) {
        if (!this.background) {
            this.background = { name: "", steps: [] }
        }
        const id = this.background.steps.push(step) - 1
        this.update()

        return (status: 'passed' | 'failed' | 'running') => {
            this.background!.steps[id].status = status
            this.update()
        }
    }

    public addStep(text: StepStatus) {
        const id = this._steps.push(text) - 1
        this.update()

        return (status: 'passed' | 'failed' | 'running') => {
            this._steps[id].status = status
            this.update()
        }
    }

    public addTag(tag: string) {
        this._tags.push(tag)
        console.debug(`added tag ${tag}, now tags are ${this._tags}`)
        this.update()
    }

    public get tags() {
        return this._tags
    }

    public removeStep(i: number) {
        this._steps.splice(i, 1)
        this.update()
    }

    public removeBackgroundStep(i: number) {
        this.background.steps.splice(i, 1)
        this.update()
    }

    public clear() {
        this._steps = []
        this._name = undefined
        this._tags = []
        this.featureId = undefined
        this.featureName = undefined
        this.background = {
            name: "",
            steps: []
        }
        this.update()
    }

    getText(containBackground = true) {
        let scenario = `
${this._tags}
Scenario: ${this.name}
${this._steps.map(step => '\t' + step.text).join('\n')}
        `.trim()

        if (this.hasBackground() && containBackground) {
            const background = `Background: ${this.background.name}
${this.background.steps.map(step => '\t' + step.text).join('\n')}
            `.trim()

            return background + '\n\n' + scenario
        }

        return scenario
    }
}