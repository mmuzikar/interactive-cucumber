import {editor as e, languages, editor} from "monaco-editor";
import * as monaco from "monaco-editor";
import { ID } from "./CommonFeatures";
import { Cucumber } from "../interop/Cucumber";

let runStepId : string;

export function registerEditorActions(editor:e.IStandaloneCodeEditor){
    registerRunStep(editor);
    registerRunAll(editor);
    registerTest(editor);
}

function registerRunStep(editor:e.IStandaloneCodeEditor){
    editor.addAction({
        contextMenuGroupId: ID,
        id: 'feature-run-step',
        label: 'Run Cucumber Step',
        keybindings: [

        ],
        run: (e) => {
            const selection = e.getSelection();
            const model = e.getModel();
            if (selection && model){
                Services.get().evaluate(model, selection.startColumn);
            } 
        },

    });
    runStepId = editor.addCommand(0, (ctx, model, lineNum) => {
        Services.get().evaluate(model, lineNum);
    }, 'test')!;
    //TODO swich to services to support data tables and data strings
    languages.registerCodeLensProvider(ID, {
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

function registerRunAll(editor:e.IStandaloneCodeEditor){
    editor.addAction({
        contextMenuGroupId: ID,
        id: 'run-all',
        label: 'Run all',
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