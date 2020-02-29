import { Step } from "./cucumberTypes";
import { StepManager } from "./stepManager";

export class Cucumber {

    public static DATATABLE_TYPE = "cucumber.api.DataTable";
    public static STEP_PATTERN = /(?:Given|When|Then|And|But)\s(.*)/;

    /**
    * @returns true if str is a step 
    */
    public static isStep(str:string):boolean{
        const line = str.trim();
        if (line.length <= 0){
            return false;
        }
        if (this.STEP_PATTERN.test(str)){
            return true;
        }
        return false;
    }

    public static extractValue(str:string):string {
        const match = str.trim().match(this.STEP_PATTERN);
        if (match){
            return match[1];
        }
        return "";
    }

    /**
     * Takes step with all the fuss around that is not in the definition and finds the right 
     * step definition for it
     * @param str Actual step  
     */
    public static findRightStep(str:string):Step | undefined{
        if (Cucumber.isStep(str)){
            const actualStep = Cucumber.extractValue(str);
            const step = StepManager.get().getStepsSync().find((val) => {
                const match = actualStep.match(val.pattern)
                if (match && match[0] === actualStep){
                    return val;
                }
            });
            return step;
        }
    }

}