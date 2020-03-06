import { Cucumber } from "../Cucumber";
import { StepManager } from "../stepManager";
import { Service, Model, ServiceResult } from "./Service";

export class CucumberService extends Service {
    
    
    canHandle(line: string): boolean {
        return Cucumber.STEP_PATTERN.test(line);
    }
    
    handle(model: Model, from:number): ServiceResult {
        const stepDef = Cucumber.findRightStep(this.peek(model, from));
        if (stepDef){
            let step = Cucumber.extractValue(this.consumeLine(model, from));
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
            StepManager.get().runStep(step);
        } else {
            //TODO give feedback about unknown step
            console.warn(`${this.consumeLine(model, from)} is not a valid step`)
        }
    }
}