import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import * as  monaco from "monaco-editor";
import { registerCommonExtensions } from "../editor/CommonFeatures";
import { StepManager } from "../interop/stepManager";
import { Cucumber } from "../interop/Cucumber";
import { Step } from "../interop/cucumberTypes";
import { registerEditorActions } from "../editor/EditorActions";

type Props = {

}

type State = {
    editor: monaco.editor.IStandaloneCodeEditor
}

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

    }

    mountEditor(e: monaco.editor.IStandaloneCodeEditor){
        this.setState({
            editor: e
        });
        registerEditorActions(e);
        e.setModel(monaco.editor.createModel(`
#@sustainer: mmuzikar@redhat.com
Feature: testing editor

    @tag
    Scenario: editor
        When I type this 
        Then it should be "highlighted"
        | tasdf | asdf |
        `, "feature"));
        registerCommonExtensions();
    }

    decorations?: string[];

    async editorChanged(val:string, event:monaco.editor.IModelContentChangedEvent){
        const steps = await StepManager.get().getSteps();
        let lines : number[] = [];
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
        return <MonacoEditor editorDidMount={this.mountEditor} options={this.options} onChange={this.editorChanged}/>
    }
}