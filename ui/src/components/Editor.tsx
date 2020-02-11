import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import { HistoryManager } from "../interop/historyManager";

type State = {
    code: string
}

export class Editor extends Component<{}, State> {

    state = {
        code: ""
    }

    componentDidMount(){
        this.setState({
            code: HistoryManager.get().getScenario()
        });
    }

    render(){
        return <MonacoEditor value={this.state.code}/>
    }
}