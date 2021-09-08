import Fuse from "fuse.js";
import React from "react";
import { fetchAPI, postApi } from "../config/Utils";
import Parser from "gherkin/dist/src/Parser";
import AstBuilder from "gherkin/dist/src/AstBuilder";
import * as messages from "@cucumber/messages";
import Queue from "queue";

export type Argument = (RegexArgument | GherkinArgument) & {
    type: string,
    suggProvider: string
}

export type RegexArgument = {
    pattern: RegExp
}
export type GherkinArgument = {
    name: string
}

export class StepDefinition {
    pattern: string
    arguments: Argument[]
    docs?: string
    location: string
    private regexPattern?: RegExp


    constructor(pattern: string, args: Argument[], location: string, docs?: string) {
        this.pattern = pattern
        this.arguments = args
        this.docs = docs
        this.location = location

        if (pattern.startsWith("^") && pattern.endsWith("$")) {
            try {
                let regex = new RegExp(pattern)
                this.regexPattern = regex
            } catch (e) {

            }
        }
    }

    public matches(text: string): boolean {
        if (this.regexPattern) {
            return this.regexPattern.test(text)
        } else {
            //TODO
            return false
        }
    }

    public asSnippetPattern(): string {
        if (this.regexPattern) {
            const regexRemoved = this.getPatternWithoutControlChars()
            const pattern = regexRemoved
            let params: { start: number, end: number }[] = []
            let start = 0, end = 0, parN = 0
            for (let i = 1; i < pattern.length; i++) {
                if (pattern[i] === '(' && pattern[i - 1] !== '\\' && pattern[i + 1] !== '?') {
                    start = i;
                }
                if (pattern[i] === ')' && pattern[i - 1] !== '\\') {
                    end = i;
                    params[parN] = {
                        start: start,
                        end: end
                    }
                    parN++;
                }
            }
            if (params.length > 0) {
                let ret = [];
                ret.push(pattern.substring(0, params[0].start));
                ret.push(`\${1:${pattern.substring(params[0].start, params[0].end + 1)}}`);
                let i = 1;
                for (i = 1; i < params.length; i++) {
                    ret.push(pattern.substring(params[i - 1].end + 1, params[i].start));
                    ret.push(`\${${i + 1}:${pattern.substring(params[i].start, params[i].end + 1)}}`);
                }
                ret.push(pattern.substring(params[params.length - 1].end + 1));
                if (this.arguments[this.arguments.length - 1].type.endsWith("DataTable")) {
                    ret.push(`\n\t| \${${i + 1}:<table-val>} |`);
                } else if (params.length !== this.arguments.length && this.arguments[this.arguments.length - 1]?.type.endsWith("String")) {
                    ret.push(`\n"""\n\${${i + 1}:<string-val>}\n"""`)
                }
                return ret.join("");
            } else {
                return pattern
            }
        } else {
            let i = 1;
            let snippet = this.pattern.replaceAll(/{[^}]*}/g, (val) => `\${${i++}:${val}}`)    
            if (this.arguments[this.arguments.length - 1]?.type.endsWith("DataTable")) {
                snippet += `\n\t| \${${i + 1}:<table-val>} |`;
            } else if (i === this.arguments.length && this.arguments[this.arguments.length - 1]?.type.endsWith("String")) {
                snippet += `\n"""\n\${${i + 1}:<string-val>}\n"""`
            }
            return snippet
        }
    }

    public getPatternWithoutControlChars() {
        if (this.regexPattern) {
            return this.pattern.substring(1, this.pattern.length - 1)
        }
        return this.pattern
    }

    public async provideSuggestions(text: string): Promise<{ id: number, val: string[] }[]> {
        if (this.arguments) {
            for (let i = 0; i < this.arguments.length; i++) {
                let ret: Promise<{ id: number, val: string[] }>[] = []
                if (this.arguments[i].suggProvider && this.arguments[i].suggProvider.length > 0) {
                    ret.push(new Promise(async (resolve, reject) => {
                        const resp = await postApi('suggestions', JSON.stringify({
                            providerType: this.arguments[i].suggProvider,
                            stepVal: text
                        }))
                        const vals = await resp.json() as string[]
                        resolve({
                            id: i,
                            val: vals
                        })
                    }));
                }
                return Promise.all(ret)
            }
        }
        return Promise.resolve([])
    }

    public async run() {

    }
}

export interface DataType {

}

export class Feature {
    source: string
    uri: string

    readonly name?: string
    readonly tags?: string[]

    readonly description?: string;

    scenarios?: Scenario[]

    static featureId: number = 0
    static parser = new Parser(new AstBuilder(messages.IdGenerator.incrementing()))

    private parsedFeature?: messages.Feature

    private background?: messages.Background

    constructor(source: string, uri: string) {
        this.source = source
        this.uri = uri
        this.parse()

        if (this.parsedFeature) {
            this.description = this.parsedFeature.description
            this.name = this.parsedFeature.name
            this.tags = this.parsedFeature.tags.map(tag => tag.name)

            this.scenarios = []

            this.background = this.parsedFeature.children.find(child => child.background)?.background as messages.Background

            this.parsedFeature.children.forEach(child => {
                if (child.scenario) {
                    this.scenarios?.push(new Scenario(child.scenario, this.background))

                } else if (child.rule) {
                    //TODO
                }
            })
        }
    }

    private parse() {
        const document: messages.GherkinDocument = Feature.parser.parse(this.source)

        if (document.feature) {
            this.parsedFeature = document.feature;
        }
    }
}

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

type StepStatus = { text: string, status: 'running' | 'failed' | 'passed' | 'scheduled' }

class EditableScenario {

    featureId?: string
    _feature?: string
    _name?: string
    _steps: StepStatus[] = []
    _tags: string[] = []

    background? : {
        name: string,
        steps: StepStatus[]
    }

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

    public get featureName() : string | undefined {
        return this._feature
    }

    public get steps() {
        return this._steps
    }

    public hasBackground() : boolean {
        return this.background !== undefined
    }

    public setBackgroundName(text: string) {
        if (!this.background) {
            this.background = {name: text, steps: []}
        } else {
            this.background.name = text
        }
        this.update()
    }

    public addBackgroundStep(step : StepStatus) {
        if (!this.background){
            this.background = {name: "", steps: []}
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

    public clear() {
        this._steps = []
        this._name = undefined
        this._tags = []
        this.featureId = undefined
        this.featureName = undefined
        this.update()
    }

    getText() {
        return (
            `
${this._tags}
Scenario: ${this.name}
${this._steps.map(step => '\t' + step.text).join('\n')}
        `.trim())
    }


}

export class CucumberContextType {
    stepDefs: StepDefinition[]
    dataTypes: DataType[]
    features: Feature[]
    private fuse: Fuse<StepDefinition>
    private stepQueue: Queue

    setEditorContent?: (text: string) => void

    currentScenario: EditableScenario = new EditableScenario()

    searchOptions: Fuse.IFuseOptions<StepDefinition> = {
        shouldSort: true,
        includeScore: true,
        ignoreLocation: true,
        keys: ['pattern', 'docs']
    }

    constructor(stepDefs: StepDefinition[], dataTypes: DataType[], features: Feature[]) {
        this.stepDefs = stepDefs
        this.dataTypes = dataTypes
        this.features = features

        this.fuse = new Fuse(this.stepDefs, this.searchOptions)
        this.stepQueue = new Queue({autostart: true, timeout: undefined, concurrency: 1})
    }

    static async create(): Promise<CucumberContextType> {
        const data = await Promise.all([
            fetchAPI('liststeps').then(resp => resp.json()).then(data => data.map((it: any) => new StepDefinition(it.pattern, it.args, it.location, it.docs))),
            fetchAPI('typeregistry').then(resp => resp.json()).then(data => data as DataType[]),
            fetchAPI('feature').then(resp => resp.json()).then(data => data.map((it: any) => new Feature(it.source, it.uri)))
        ])

        console.log(data);

        return new CucumberContextType(...data)
    }

    findStep(stepText: string, strict: boolean = true): StepDefinition | undefined {
        if (strict) {
            return this.stepDefs.find(step => step.matches(stepText))
        } else {
            let results = this.fuse.search(stepText)
            return results ? results[0].item : undefined
        }
    }

    findSteps(stepText: string) {
        return this.fuse.search(stepText)
    }

    isValidStep(stepText: string): boolean {
        return this.stepDefs.find(step => step.matches(stepText)) !== undefined
    }

    private async runStep(stepText: string): Promise<Response> {
        return postApi('runstep', stepText)
    }

    enqueueStep(stepText: string, updateStatus: (status: 'running' | 'failed' | 'passed') => void) {
        this.stepQueue.push(async () => {
            updateStatus('running')
            try {
                const resp = await this.runStep(stepText)
                updateStatus(resp.ok ? 'passed' : 'failed')
            } catch (e) {
                updateStatus('failed')
            }
        })
    }

    async provideSuggestions(stepText: string) {

    }
}

export const CucumberContext = React.createContext<CucumberContextType>(undefined!)
