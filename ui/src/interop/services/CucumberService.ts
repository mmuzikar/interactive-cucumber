import { Cucumber } from "../Cucumber";
import { StepManager } from "../stepManager";
import { Service, Model, ServiceResult } from "./Service";
import { ResultType } from "../feedback";
import { Step, IStep } from "../cucumberTypes";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import Fuse from "fuse.js";

export interface CucumberServiceResult extends ServiceResult {
    stepDef?: IStep,
    stepVal: string,
    id: number
}

//Handles all cucumber related stuff
export class CucumberService extends Service<CucumberServiceResult> {
    
    static id:number = 0;
    
    canHandle(line: string): boolean {
        return Cucumber.STEP_PATTERN.test(line);
    }
    
    handle(model: Model, from:number) : ResultType {
        const stepDef = Cucumber.findRightStep(this.peek(model, from));
        if (stepDef){
            const stepLine = this.consumeLine(model, from);
            let step = Cucumber.extractValue(stepLine);
            if (stepDef.args && stepDef.args.length > 0) {
                const args = stepDef.args;
                const lastArg = args[args.length - 1];
                if (lastArg.type.endsWith("DataTable"))  {
                    //Consuming data table
                    while(this.peek(model, from).trim().startsWith("|")){
                        const tableLine = this.consumeLine(model, from);
                        step += `\n${tableLine}`;
                    }
                } else if (lastArg.type ===  "java.lang.String" && !lastArg.start){
                    //Consuming doc string
                    if (this.peek(model, from).trim().startsWith('"""')){
                        const startString = this.consumeLine(model, from);
                        step += `\n${startString}`;
                        while (!this.peek(model, from).trim().startsWith('"""')){
                            const str = this.consumeLine(model, from);
                            step += `\n${str}`;
                        }
                        if (this.peek(model, from).trim().startsWith('"""')){
                            const endString = this.consumeLine(model, from);
                            step += `\n${endString}`;
                        }
                    }
                }
            }
            let event = {
                    service: this,
                    stepDef: stepDef.toIStep(),
                    stepVal: stepLine,
                    data: stepLine.trim().split(/\s+/)[0] + ' ' + step,
                    id: CucumberService.id++
                };
            StepManager.get().runStep(step).then((result) => {
                this.dispatcher.dispatch({...event, status: result})
            });
            this.dispatcher.dispatch({...event, status: ResultType.WAITING});
            return ResultType.WAITING;
        } else {
            //TODO give feedback about unknown step
            const line = this.consumeLine(model, from);
            this.dispatcher.dispatch({id: CucumberService.id++, stepVal: line, status: ResultType.FAILURE});
            console.warn(`${line} is not a valid step`)
            return ResultType.FAILURE;
        }
    }

    searchOptions : Fuse.FuseOptions<Step> = {
        shouldSort: true,
        distance: 100,
        minMatchCharLength: 1,
        keys: [
            {
                name: "pattern",
                weight: 0.6 
            }, {
                name: "docs",
                weight: 0.2
            }, {
                name: "location",
                weight: 0.2
            }
        ]
    }

    findClosestStep(line:string):Step | undefined{
        const fuse = new Fuse<Step, Fuse.FuseOptions<Step>>(StepManager.get().getStepsSync(), this.searchOptions);
        const steps = fuse.search(line);
        return steps[0] as Step || undefined;
    }

    //Provide suggestion for a closest match to the current step
    provideArgSuggestions(line:string, range:monaco.IRange) : Promise<monaco.languages.CompletionItem[]>{
        const steps = StepManager.get().getStepsSync();
        let fStep = steps.find(s => s.pattern.test(line));
        if (!fStep){
            fStep = this.findClosestStep(line);
        }
        if (fStep){
            return fStep.getSuggestions(line, range);
        }
        return Promise.resolve([]);
    }

    //Provide suggestion for a closest match to the current step
    async provideSuggestions(model:Model, position: monaco.Position, context: monaco.languages.CompletionContext) : Promise<monaco.languages.CompletionItem[]> {
        const line = model.getLineContent(position.lineNumber);
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };
        if (line.match(Cucumber.STEP_PATTERN)){
            const stepSuggestions = await StepManager.get().getSteps();
            let sugs = stepSuggestions.map(step => ({
                range: range,
                label: step.pattern.source,
                insertText: step.getPlaceholderText(),
                kind: monaco.languages.CompletionItemKind.Value,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            })) as monaco.languages.CompletionItem[];
            sugs = sugs.concat(await this.provideArgSuggestions(line, range));
            return sugs;            
        }
        //Return cucumber keywords
        return ["When", "Then", "Given", "And", "But"].map(word => ({
                range: range,
                label: word,
                insertText: word,
                kind: monaco.languages.CompletionItemKind.Keyword
            }));
    }

}