import { Service, ServiceResult, Model } from "./Service";
import { ResultType } from "../feedback";

//Consumes comment and adds it to the output
export class CommentService extends Service<ServiceResult> {
    canHandle(line: string): boolean {
        return line.trim().startsWith("#");
    }    
    
    handle(model: Model, from: number): ResultType {
        const line = this.consumeLine(model, from);
        this.dispatcher.dispatch({
            status: ResultType.SUCCESS,
            data: line
        });
        return ResultType.SUCCESS;
    }


}