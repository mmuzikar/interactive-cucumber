import React, { Component } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor";
import { HistoryManager, HistoryEntry } from "../interop/historyManager";
import "../styles/outputEditor.css"

type Props = {

}

type State = {
    editor: monaco.editor.IStandaloneCodeEditor,
    history: HistoryEntry[]
}

export class OutputEditor extends Component<Props, State> {

    config : monaco.editor.IEditorConstructionOptions = {
        glyphMargin: true
    }

    constructor(props:Props){
        super(props);
        this.mountEditor = this.mountEditor.bind(this);
        HistoryManager.get().historyDispatcher.register((entry) => {
            this.setState((prev) => {
                if (!prev.history){
                    return {
                        history: []
                    }
                }
                const history = prev.history;
                history[entry.id] = entry;
                return {
                    history: history
                }
            }, this.refreshValue)
        })
    }

    oldDecorations:string[]= [];

    refreshValue(){
        const {editor} = this.state;
        const history = HistoryManager.get().history;
        const newVal = history.map(entry => 
            entry.step
        ).join("\n");
        editor.setValue(newVal);
        const newDecorations = history.map((val, i) => ({
            range: new monaco.Range(i + 1, 1, i + 1, 1),
            options: {
                isWholeLine: true,
                glyphMarginClassName: `marginGlyphStatus-${val.status}`,

            }
        }));
        console.debug(history);
        console.debug(newDecorations);
        if (newDecorations){
            this.oldDecorations = editor.deltaDecorations(this.oldDecorations, newDecorations);
        }

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

    mountEditor(e: monaco.editor.IStandaloneCodeEditor){
        this.setState({
            editor: e
        });
        e.setModel(monaco.editor.createModel("", "feature"));
        this.defineTheme();
        monaco.editor.setTheme('output-theme');
    }


    render(){
        return <MonacoEditor editorDidMount={this.mountEditor} options={this.config}/>
    }
}