import Fuse from "fuse.js";
import React from "react";
import { fetchAPI, postApi } from "../utils/Utils";
import Queue from "queue";
import { StepDefinition } from "./cucumber/StepDefinition";
import { Feature } from "./cucumber/Feature";
import { EditableScenario } from "./cucumber/EditableScenario";


export interface DataType {

}

export class CucumberContextType {
    stepDefs: StepDefinition[]
    dataTypes: DataType[]
    features: Feature[]
    private fuse: Fuse<StepDefinition>
    private stepQueue: Queue

    setEditorContent?: (text: string) => void
    addLineToEditor?: (text: string) => void

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
        this.stepQueue = new Queue({ autostart: true, timeout: undefined, concurrency: 1 })
    }

    static async create(): Promise<CucumberContextType> {
        const data = await Promise.all([
            fetchAPI('liststeps').then(resp => resp.json()).then(data => data.map((it: any) => new StepDefinition(it.pattern, it.args, it.location, it.docs, it.tags))),
            fetchAPI('typeregistry').then(resp => resp.json()).then(data => data as DataType[]),
            fetchAPI('feature').then(resp => resp.json()).then(data => data.map((it: any) => new Feature(it.source, it.uri)))
        ])

        console.log('Init values', data);

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

    findClosestStep(stepText: string) {
        return this.fuse.search(stepText, {limit: 1})
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