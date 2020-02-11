import React, { Component } from "react";
import { StepManager } from "../interop/stepManager";
import { ResultType } from "../interop/feedback";
import { HistoryManager, HistoryEntry } from "../interop/historyManager";

export class History extends Component<{}, {history: HistoryEntry[]}> {

    componentDidMount(){
        HistoryManager.get().historyDispatcher.register((_) => this.forceUpdate());
    }

    render(){
        return <ul>
            {HistoryManager.get().history.map((hist, id) => <CHistoryEntry entry={hist} key={`history_item_${id}`}/>)}
        </ul>;
    }

}

class CHistoryEntry extends Component<{entry: HistoryEntry}> {

    render(){
        return <li className={`history-entry-status-${this.props.entry.status}`}>
            {this.props.entry.step}
        </li>
    }

}