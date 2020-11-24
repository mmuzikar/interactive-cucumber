import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor";
import "../styles/outputEditor.css"
import { Services } from "../interop/Services";
import { CucumberService, CucumberServiceResult } from "../interop/services/CucumberService";
import { ServiceResult, Service } from "../interop/services/Service";
import { ResultType } from "../interop/feedback";
import { OUTPUT_ID, registerOutputEditorExtensions } from "../editor/CommonFeatures";
import { CommentService } from "../interop/services/CommentService";
import { VariableService } from "../interop/services/VariableService";

const getVarService = () => Services.get().services.find(svc => svc instanceof VariableService) as VariableService;
const getVar = (key:string) => getVarService().getValue(key) || key;
type Props = {
    rowHeight: number,
    colWidth: number
}
enum Type {
    STEP,
    COMMENT,
    GHERKINTEXT
}

type Line = {text:string, decorations?:monaco.editor.IModelDecorationOptions};

interface EditorLine {
    getLine():Line;
}

class Step implements EditorLine {
    type : Type = Type.STEP;
    constructor(public value:string, public id:number, public status:ResultType){}
    getLine():Line{
        return {
            text: this.value,
            decorations: {
                isWholeLine: true,
                glyphMarginClassName: `marginGlyphStatus-${this.status}`
            }
        }
    }
}
class Comment implements EditorLine {
    type : Type = Type.COMMENT;
    constructor(public value:string){}
    getLine():Line{
        return {
            text: this.value
        }
    }
}
class GherkinText implements EditorLine {
    type : Type = Type.GHERKINTEXT;
    constructor(public value:string, public keyword:string){}
    getLine():Line{
        return {
            text: `${this.keyword}: ${getVar(this.value.substring(1, this.value.length))}`
        }
    }
}
type Entry = Step | Comment | GherkinText; 

type State = {
    editor: monaco.editor.IStandaloneCodeEditor,
    steps: Entry[]
}

//Output editor for displaying the results of current scenario
export class OutputEditor extends Component<Props, State> {

    config : monaco.editor.IEditorConstructionOptions = {
        glyphMargin: true,
        dimension: {
            width: this.props.colWidth * 4 - 30,
            height: this.props.rowHeight * 6,
        },
        minimap: {
            enabled: false
        }
    }

    constructor(props:Props){
        super(props);
        this.mountEditor = this.mountEditor.bind(this);
        this.setText = this.setText.bind(this);
        this.cucumberResult = this.cucumberResult.bind(this);
        this.commentResult = this.commentResult.bind(this);
    }

    cucumberResult(result:CucumberServiceResult){
        const step = this.state.steps.find(step => step instanceof Step && step.id === result.id);
        if (step){
            let steps = this.state.steps;
            const i = steps.findIndex(s => s === step);
            let s = steps[i] as Step;
            s.status = result.status;
            this.setState({
                steps: steps
            })
        } else {
            this.setState((old) => ({
                steps: [...old.steps, new Step(result.data, result.id, result.status)]
            }));
        }
        this.forceUpdate();
    }

    commentResult(result:ServiceResult){
        this.setState((old) => ({
            steps: [...old.steps, new Comment(result.data)]
        }));
    }

    componentDidMount(){
        this.setState({
            steps: [
                new GherkinText("$feature", "Feature"),
                new GherkinText("$scenario", "Scenario")
            ]
        })
        let cucumberSvc = Services.get().services.find(svc => svc instanceof CucumberService) as CucumberService;
        if (cucumberSvc){
            cucumberSvc.dispatcher.register(this.cucumberResult);
        }
        let commentService = Services.get().services.find(svc => svc instanceof CommentService) as CommentService;
        if (commentService){
            commentService.dispatcher.register(this.commentResult);
        }
        getVarService().dispatcher.register((_) => this.forceUpdate());
    }

    oldDecorations:string[]= [];

    refreshValue(){

    }

    defineTheme(){
        monaco.editor.defineTheme('output-theme', {
            base: 'vs',
            inherit: true,
            colors: {},
            rules: [
                {token: 'marginGlyphStatus-success', background: '00ff00'},
                {token: 'marginGlyphStatus-failure', background: 'ff0000'}

            ]
        })
    }

    //Remove failed steps before exporting
    export(){
        this.setState(old => (
            {
                steps: old.steps.filter(val => val instanceof Step ? val.status != ResultType.FAILURE : true)
            }
        ))
    }

    mountEditor(e: monaco.editor.IStandaloneCodeEditor){
        this.setState({
            editor: e
        });
        e.setModel(monaco.editor.createModel("", OUTPUT_ID));
        this.defineTheme();
        registerOutputEditorExtensions(e, this);
        monaco.editor.setTheme('output-theme');
    }

    setText(){
        if (!this.state)
            return;
        let indent = 0;
        const src : string[] = [];
        this.state.steps.forEach(val => {
            src.push('\t'.repeat(indent) + val.getLine().text);
            if (val instanceof GherkinText){
                indent += 1;
            }
        });
        this.state.editor.setModel(monaco.editor.createModel(src.join("\n"), OUTPUT_ID));
        let line = 1;
        let decorations : monaco.editor.IModelDeltaDecoration[] = [];
        this.state.steps.forEach((val) => {
            const l = val.getLine()
            const deco = l.decorations;
            const length = l.text.split("\n").length;
            if (deco){
                decorations.push({
                    range: new monaco.Range(line, 0, line, 0),
                    options: deco
                })
            }
            line += length;
        })
        this.oldDecorations = this.state.editor.deltaDecorations(this.oldDecorations, decorations);
    }


    render(){
        this.setText();
        return <div style={{height: "100%"}}>
            <h3>Feature output</h3>
            <MonacoEditor editorDidMount={this.mountEditor} options={this.config}/>
        </div>
    }
}