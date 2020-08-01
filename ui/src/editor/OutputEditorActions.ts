import {editor as e} from "monaco-editor";
import { OutputEditor } from "../components/OutputEditor";


class ExportWidget implements e.IOverlayWidget {

    constructor(private editor:e.IStandaloneCodeEditor, private el:OutputEditor){}

    domNode?: HTMLElement
    
    getId(): string {
        return 'feature-ex.export.widget';
    }
    getDomNode(): HTMLElement {
        if (!this.domNode){
            this.domNode = document.createElement("button");
            this.domNode.classList.add("overlay-button");
            this.domNode.innerHTML = "Export"
            this.domNode.style.right = '30px';
            const height = 32;
            const offset = 5;
            this.domNode.style.fontSize = "larger";
            this.domNode.style.height = `${height}px`;
            this.domNode.style.top = this.editor.getDomNode()!.clientHeight - height - offset + "px";
            this.domNode.onclick = () => this.el.export();
        }
        return this.domNode!;
    }
    getPosition(): e.IOverlayWidgetPosition | null {
        return null;
    }


}

export function addExportWidget(editor:e.IStandaloneCodeEditor, el:OutputEditor){
    const exportW = new ExportWidget(editor, el);
    editor.addOverlayWidget(exportW);
}