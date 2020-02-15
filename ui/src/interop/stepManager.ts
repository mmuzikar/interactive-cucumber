import { AppConfig } from "./config";
import { Step } from "./cucumberTypes";
import { Result, ResultType, HistoryResult } from "./feedback";
import { Dispatcher } from "flux";
import { HistoryManager } from "./historyManager";


export class StepManager {

    private static instance: StepManager;
    private stepRepo: Step[] = [];
    private dirty: boolean = true;

    public static get():StepManager{
        if (!StepManager.instance){
            StepManager.instance = new StepManager();
        }
        return StepManager.instance;
    }

    getSteps():Promise<Step[]>{
        return new Promise((resolve) => {
            if (this.dirty){
                this.fetchSteps(resolve);
            }
            else {
                resolve(this.stepRepo);
            }
        })
    }

    analyzeParams(steps:Step[]){
        return steps.map((step) => {
            if (step.args){
                let params = step.args;
                let start = 0;
                let end = 0;
                let parN = 0;
                for (let i = 1; i < step.pattern.length; i++){
                    if (step.pattern[i] === '(' && step.pattern[i-1] !== '\\' && step.pattern[i+1] !== '?'){
                        start = i;
                    }
                    if (step.pattern[i] === ')' && step.pattern[i-1] !== '\\'){
                        end = i;
                        params[parN].start = start;
                        params[parN].end = end;
                        parN++;
                    }
                }
                return step;
            } else {
                return step;
            }
        })
    }

    getSuggestionForArg(step:Step, i:number, stepArgs:string[] = []):Promise<{val: string}[]> | undefined{
        if (step.args){
            const args = step.args;
            
            const arg = args[i];
            if (arg.suggProvider !== ""){
                return new Promise((resolve) => {
                    if (i < 0 || i >= args.length){
                        resolve([]);
                    }
                    else {
                        fetch(`${AppConfig.getServerUrl()}/suggestion`, {
                            method: "POST",
                            body: JSON.stringify({
                                step: step.pattern,
                                args: stepArgs,
                                argId: i
                            })
                        }).then((r => r.json())).then((suggs:string[]) => {
                            console.log(suggs.map((v) => ({val: v})));
                            resolve(suggs.map((v) => ({val: v})))
                        })
                    }
                });
            }
        } else {
            return undefined;
        }
    }

    fetchSteps(callback:(value?:Step[]) => void | undefined){
        fetch(`${AppConfig.getServerUrl()}/liststeps`).then((r) => r.json()).then((steps:Step[]) => {
            this.stepRepo = this.analyzeParams(steps);
            if (callback){
                callback(this.stepRepo);
            }
            this.dirty = false;
        })
    }

    runStep(step: string) {
        const id = HistoryManager.get().report({
            status: ResultType.WAITING,
            step: step,
        });
        fetch(`${AppConfig.getServerUrl()}/runstep`, {
            body: step,
            method: "POST",
        }).then().then((res) => {
            if (res.ok){
                HistoryManager.get().reportForId(id, ResultType.SUCCESS);
            } else {
                HistoryManager.get().reportForId(id, ResultType.FAILURE);
            }
        });
    }
}