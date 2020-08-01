import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import * as  monaco from "monaco-editor";
import { registerCommonExtensions, INPUT_ID, registerInputEditorExtensions } from "../editor/CommonFeatures";
import { StepManager } from "../interop/stepManager";
import { Cucumber } from "../interop/Cucumber";
import { Step } from "../interop/cucumberTypes";
import { registerEditorActions } from "../editor/EditorActions";
import "../styles/editors.css";

type Props = {
    rowHeight: number,
    colWidth: number
}

type State = {
    editor: monaco.editor.IStandaloneCodeEditor
}

//The input editor used to execute the steps
export class InputEditor extends Component<Props, State> {

    constructor(props:Props){
        super(props);
        this.mountEditor = this.mountEditor.bind(this);
        this.editorChanged = this.editorChanged.bind(this);
    }

    options : monaco.editor.IEditorConstructionOptions = {
        minimap: {
            enabled: false
        },
        dimension: {
            width: this.props.colWidth * 4 - 30,
            height: this.props.rowHeight * 6,
        }
    }

    static editor: monaco.editor.IStandaloneCodeEditor;

    mountEditor(e: monaco.editor.IStandaloneCodeEditor){
        this.setState({
            editor: e
        });
        //Creating a model and registering required functionality
        e.setModel(monaco.editor.createModel(``, INPUT_ID));
        registerCommonExtensions();
        registerInputEditorExtensions(e);
        InputEditor.editor = e;
    }

    //Used to track old decorations by monaco editor
    decorations?: string[];

    async editorChanged(val:string, event:monaco.editor.IModelContentChangedEvent){
        let lines : number[] = [];
        //add squiggly lines to steps that don't match any step definition
        val.split('\n').forEach((str, i) => {
            if (Cucumber.isStep(str)){
                const step = Cucumber.findRightStep(str);
                if (!(step instanceof Step)){
                    lines.push(i + 1);
                }
            }
        })
        this.decorations = this.state.editor.deltaDecorations(this.decorations || [], lines.map((i) => ({
            range: new monaco.Range(i, 1, i, 1),
            options: {
                isWholeLine: true,
                inlineClassName: 'squiggly-error'
            }
        } as monaco.editor.IModelDeltaDecoration)));
    }


    render(){
        return <div style={{height: "100%", borderRight: "2px solid #cccccc"}}>
            <h3>Input console</h3>
            <MonacoEditor editorDidMount={this.mountEditor} options={this.options} onChange={this.editorChanged}/>
        </div>
    }
}