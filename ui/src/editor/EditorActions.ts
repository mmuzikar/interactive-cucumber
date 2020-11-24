import {editor as e, languages, editor} from "monaco-editor";
import * as monaco from "monaco-editor";
import { INPUT_ID } from "./CommonFeatures";
import { Cucumber } from "../interop/Cucumber";

let runStepId : string;

export function registerEditorActions(editor:e.IStandaloneCodeEditor){
    registerRunStep(editor);
    registerRunAll(editor);
    registerTest(editor);
    addRunAllButton(editor);
}

function registerRunStep(editor:e.IStandaloneCodeEditor){
    editor.addAction({
        contextMenuGroupId: INPUT_ID,
        id: 'feature-run-step',
        label: 'Run Cucumber Step',
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
        ],
        run: (e) => {
            const selection = e.getSelection();
            const model = e.getModel();
            if (selection && model){
                Services.get().evaluate(model, selection.startLineNumber);
            } 
        },

    });

    runStepId = editor.addCommand(0, (ctx, model, lineNum) => {
        Services.get().evaluate(model, lineNum);
    }, 'test')!;

    languages.registerCodeLensProvider(INPUT_ID, {
        provideCodeLenses: (model, provider) => {
            const matches = model.findMatches(Cucumber.STEP_PATTERN.source, true, true, false, " ", true);
            if (matches){
                const lenses = matches.map((match) => ({
                    range: match.range,
                    id: "Run-Step-CodeLens",
                    command: {
                        id: runStepId,
                        title: "Run Step",
                        tooltip: "Runs the step",
                        arguments: [model, match.range.startLineNumber]
                    } as languages.Command
                }))
                const result : languages.ProviderResult<languages.CodeLensList> = {
                    lenses: lenses,
                    dispose: function (){},
                }
                return result;
            }
            return null;
        },
        resolveCodeLens: (model: editor.ITextModel, codeLens: languages.CodeLens, token: monaco.CancellationToken) => {
            return codeLens;
        }
    });
}
import { Services } from "../interop/Services";
const runAllId = 'feature.run-all'
function registerRunAll(editor:e.IStandaloneCodeEditor){
    editor.addAction({
        contextMenuGroupId: INPUT_ID,
        id: runAllId,
        label: 'Run all',
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter
        ],
        run: (e) => {
            const model = e.getModel();
            if (model){
                let line = 1;
                let failSafe = model.getLineCount();
                while (model.getLineCount() > 0 && model.getValue()){
                    Services.get().evaluate(model, line);
                    failSafe--;
                    if (failSafe < 0)
                        break;
                }
            }
        }
    })
}

function registerTest(editor:e.IStandaloneCodeEditor){
    editor.addAction({
        id: 'feature-test',
        label: 'Feature: test',
        run: (e) => {
            const model = e.getModel();

            if (model){
                model.applyEdits([
                    {
                        range: new monaco.Range(1, 0, 2, -1),
                        text: ""
                    }
                ])
            }
        }
    })
}

class RunAllWidget implements e.IOverlayWidget {

    constructor(private editor:e.IStandaloneCodeEditor){}

    domNode?: HTMLElement
    
    getId(): string {
        return 'feature.runall.widget';
    }
    getDomNode(): HTMLElement {
        if (!this.domNode){
            this.domNode = document.createElement("button");
            this.domNode.classList.add("overlay-button");
            this.domNode.innerHTML = "Run all steps"
            this.domNode.style.right = '30px';
            const height = 32;
            const offset = 5;
            this.domNode.style.fontSize = "larger";
            this.domNode.style.height = `${height}px`;
            this.domNode.style.top = this.editor.getDomNode()!.clientHeight - height - offset + "px";
            this.domNode.onclick = () => this.editor.getAction(runAllId).run()
        }
        return this.domNode!;
    }
    getPosition(): e.IOverlayWidgetPosition | null {
        return null;
    }


}

function addRunAllButton(editor:e.IStandaloneCodeEditor){
    const runAll = new RunAllWidget(editor);
    editor.addOverlayWidget(runAll);
    
}