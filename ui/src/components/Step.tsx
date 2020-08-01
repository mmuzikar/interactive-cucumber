import { editor, Range } from "monaco-editor";
import React, { Component } from "react";
import { IStep as CStep } from "../interop/cucumberTypes";
import { Services } from "../interop/Services";
import { CucumberService } from "../interop/services/CucumberService";
import { InputEditor } from "./InputEditor";

type props = {
    pattern: string
};

export class Step extends Component<CStep, props> {
    
    constructor(p: props){
        super(p);
        this.sendStep = this.sendStep.bind(this);
    }

    sendStep(){
        InputEditor.editor.getModel()?.applyEdits([
            {
                range: new Range(0, 0, 0, 0),
                text: `When ${this.props.pattern}`
            }
        ])
    }

    render() {
        return <div onClick={this.sendStep} style={{cursor: 'pointer'}}>
            {this.props.pattern}
        </div>
    }
}