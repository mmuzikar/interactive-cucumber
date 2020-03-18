import { register as registerFeatureLang } from "./FeatureHighlight";
import { editor as e } from "monaco-editor";
import { registerEditorActions } from "./EditorActions";
import { addExportWidget } from "./OutputEditorActions";
import { OutputEditor } from "../components/OutputEditor";

export const INPUT_ID = "feature";
export const OUTPUT_ID = "feature-output";

export function registerCommonExtensions(){
    registerFeatureLang();
}

export function registerInputEditorExtensions(editor:e.IStandaloneCodeEditor){
    registerEditorActions(editor);
}

export function registerOutputEditorExtensions(editor:e.IStandaloneCodeEditor, el:OutputEditor){
    addExportWidget(editor, el);
}