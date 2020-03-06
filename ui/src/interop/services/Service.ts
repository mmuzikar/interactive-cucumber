import * as monaco from "monaco-editor";
import { ResultType } from "../feedback";

export type Model = monaco.editor.IModel;

export type ServiceResult = {
    ///Will map to different views i.e 0 - Output editor, 1 - log, 2 - console?
    view: number,
    result: string,
    status: ResultType,
    data: any
}

export abstract class Service {

    abstract canHandle(line: string): boolean;
    //TODO maybe this should return some result?
    abstract handle(model: Model, from: number): ServiceResult;

    canHandleModel(model: Model, from: number): boolean {
        return this.canHandle(this.peek(model, from));
    }

    consumeLines(model: Model, count: number, from: number = 1): string[] {
        const ret = model.getLinesContent().slice(from, count);
        model.applyEdits([
            {
                range: new monaco.Range(from, 0, from + count, -1),
                text: ""
            }
        ]);
        return ret;
    }

    consumeLine(model: Model, from: number = 1): string {
        const ret = model.getLineContent(from);
        model.applyEdits([
            {
                range: new monaco.Range(from, 0, from + 1, -1),
                text: ""
            }
        ]);
        return ret;
    }

    peek(model: Model, line: number = 1): string {
        return model.getLineContent(line);
    }
}