import { Dispatcher } from "flux";
import { Step } from "./cucumberTypes";
import { HistoryResult, ResultType } from "./feedback";

export type HistoryEntry = {
    id: number,
    step: string,
    status: ResultType
}

export class HistoryManager {

    static instance : HistoryManager;
    public historyDispatcher : Dispatcher<HistoryEntry> = new Dispatcher();
    public history : HistoryEntry[] = [];

    public static get(){
        if (!this.instance){
            this.instance = new HistoryManager();
        }
        return this.instance;
    }

    public report(status:{step: string, status: ResultType}):number{
        const id = this.history.length;
        this.history.push({
            ...status,
            id: id
        });
        this.historyDispatcher.dispatch(this.history[id]);
        return id;
    }

    public reportForId(id: number, status: ResultType){
        this.history[id].status = status;
        this.historyDispatcher.dispatch(this.history[id]);
    }

    public getScenario(){
        let template = `Feature: $feature \n Scenario: $scenario \n `;
        for (let h of this.history){
            template += `\tWhen ${h.step}\n`;
        }
        return template;
    }

}