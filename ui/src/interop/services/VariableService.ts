import { Service, Model, ServiceResult } from "./Service";
import { ResultType } from "../feedback";

//Allows to register variables a constant value
export class VariableService extends Service<ServiceResult> {
    
    VARIABLE_STATEMENT = /(\w+):\s*(.*)$/;
    
    variables: {[key:string]:string} = {};

    canHandle(line: string): boolean {
        return this.VARIABLE_STATEMENT.test(line);
    }

    getValue(key:string){
        return this.variables[key.toLowerCase()];
    }
    
    handle(model: Model, from: number): ResultType {
        const line = this.consumeLine(model, from);
        const res = this.VARIABLE_STATEMENT.exec(line);
        if (res){
            const name = res[1].toLowerCase();
            const val = res[2];
            this.variables[name] = val;
            this.dispatcher.dispatch({
                status: ResultType.SUCCESS,
                data: val
            });
            return ResultType.SUCCESS
        } else {
            return ResultType.FAILURE;
        }
    }




}