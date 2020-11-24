import * as monaco from "monaco-editor";
import { ResultType } from "../feedback";
import { Dispatcher } from "flux";

export type Model = monaco.editor.IModel;

export interface ServiceResult {
    status: ResultType,
    data?: any,
}

export abstract class Service<T extends ServiceResult> {

    dispatcher:Dispatcher<T> = new Dispatcher();

    abstract canHandle(line: string): boolean;
    abstract handle(model: Model, from: number):ResultType;
    async provideSuggestions(model:Model, position: monaco.Position, context: monaco.languages.CompletionContext) : Promise<monaco.languages.CompletionItem[]>{
        return Promise.resolve([]);
    }

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