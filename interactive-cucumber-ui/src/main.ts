import './style.css'
import * as monaco from 'monaco-editor'
import { createConfiguredEditor, createModelReference } from 'vscode/monaco'
import { registerFileSystemOverlay, HTMLFileSystemProvider } from 'vscode/service-override/files'
import * as vscode from 'vscode'
import { ILogService, StandaloneServices, IPreferencesService, IEditorService, IDialogService, getService, IFileService } from 'vscode/services'
import { ConfirmResult, Parts, isPartVisibile, setPartVisibility } from 'vscode/service-override/views'
import { clearStorage } from './setup'
import { CustomEditorInput } from './features/customView'
import './setup'
import './features/filesystem'

import 'vscode/default-extensions/theme-defaults'
import 'vscode/default-extensions/theme-seti'
import 'vscode/default-extensions/references-view'

const [mainDocument] = await Promise.all([
  vscode.workspace.openTextDocument(vscode.Uri.file('/tmp/test.feature')),
])
await vscode.window.showTextDocument(mainDocument, {
  preview: false
})

await createModelReference(monaco.Uri.from({ scheme: 'user', path: '/settings.json' }), `{
  "workbench.colorTheme": "Default Dark+",
  "workbench.iconTheme": "vs-seti",
  "editor.autoClosingBrackets": "languageDefined",
  "editor.autoClosingQuotes": "languageDefined",
  "editor.scrollBeyondLastLine": true,
  "editor.mouseWheelZoom": true,
  "editor.wordBasedSuggestions": false,
  "editor.acceptSuggestionOnEnter": "on",
  "editor.foldingHighlight": false,
  "editor.semanticHighlighting.enabled": true,
  "editor.bracketPairColorization.enabled": false,
  "editor.fontSize": 12,
  "audioCues.lineHasError": "on",
  "audioCues.onDebugBreak": "on",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "debug.toolBarLocation": "docked",
  "editor.experimental.asyncTokenization": true,
  "terminal.integrated.tabs.title": "\${sequence}",
  "typescript.tsserver.log": "normal"
}`)



document.querySelector('#createReplFile')!.addEventListener('click', async() => {
  const name = await vscode.window.showInputBox({
    placeHolder: 'run',
    title: 'Please enter filename' 
  }) || 'run'
  const uri = vscode.Uri.file(`/tmp/${name}.java`)
  await createModelReference(uri, `import io.github.mmuzikar.interactive.cucumber.api.BaseRunnerScript;

class ${name} extends BaseRunnerScript {
  
  public void run() {

  }

}`)
  await vscode.window.showTextDocument(uri)
})