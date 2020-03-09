import { Cucumber } from "../Cucumber";
import { StepManager } from "../stepManager";
import { Service, Model, ServiceResult } from "./Service";
import { ResultType } from "../feedback";
import { Step, IStep } from "../cucumberTypes";

export interface CucumberServiceResult extends ServiceResult {
    stepDef?: IStep,
    stepVal: string,
    id: number
}

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
            if (stepDef.args) {
                const args = stepDef.args;
                const lastArg = args[args.length - 1];
                if (lastArg.type === Cucumber.DATATABLE_TYPE)  {
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
                    data: step,
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
}