import { IFileService, ILogService, IStorageService, LogLevel, StandaloneServices, getService, initialize as initializeMonacoService } from 'vscode/services'
import { initialize as initializeVscodeExtensions } from 'vscode/extensions'
import getModelServiceOverride from 'vscode/service-override/model'
import getNotificationServiceOverride from 'vscode/service-override/notifications'
import getDialogsServiceOverride from 'vscode/service-override/dialogs'
import getConfigurationServiceOverride from 'vscode/service-override/configuration'
import getKeybindingsServiceOverride from 'vscode/service-override/keybindings'
import getTextmateServiceOverride from 'vscode/service-override/textmate'
import getThemeServiceOverride from 'vscode/service-override/theme'
import getLanguagesServiceOverride from 'vscode/service-override/languages'
import getAudioCueServiceOverride from 'vscode/service-override/audioCue'
import getViewsServiceOverride, {
  isEditorPartVisible,
  Parts,
  onPartVisibilityChange,
  isPartVisibile,
  attachPart
} from 'vscode/service-override/views'
import getDebugServiceOverride from 'vscode/service-override/debug'
import getPreferencesServiceOverride from 'vscode/service-override/preferences'
import getSnippetServiceOverride from 'vscode/service-override/snippets'
import getQuickAccessServiceOverride from 'vscode/service-override/quickaccess'
import getOutputServiceOverride from 'vscode/service-override/output'
import getTerminalServiceOverride from 'vscode/service-override/terminal'
import getSearchServiceOverride from 'vscode/service-override/search'
import getMarkersServiceOverride from 'vscode/service-override/markers'
import getAccessibilityServiceOverride from 'vscode/service-override/accessibility'
import getStorageServiceOverride, { BrowserStorageService } from 'vscode/service-override/storage'
import getExtensionServiceOverride from 'vscode/service-override/extensions'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import TextMateWorker from 'vscode/workers/textMate.worker?worker'
import OutputLinkComputerWorker from 'vscode/workers/outputLinkComputer.worker?worker'
import ExtensionHostWorker from 'vscode/workers/extensionHost.worker?worker'
import LanguageDetectionWorker from 'vscode/workers/languageDetection.worker?worker'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import { TerminalBackend } from './features/terminal'
import { openNewCodeEditor } from './features/editor'
import { toCrossOriginWorker, toWorkerConfig } from './tools/workers'

import { buildWorkerDefinition } from 'monaco-editor-workers'
import { RemoteLSP, getCucumberLangClient, registerLSPs } from './features/lsp'
import * as vscode from 'vscode'
import { CloseAction, ErrorAction } from 'vscode-languageclient'
import { TrackedRange, getUpdatedRanges } from './tools/positionTracking'
import { runStep } from './cucumber/stepRunner'

import cucumberSyntaxUrl from './syntaxes/cucumber.tmGrammar?url'
import { uid } from 'uid'
import { getCucumberExtensionContributions, registerViews } from './views/views'


import { registerFileSystemOverlay } from 'vscode/service-override/files'
import { RemoteFileSystemOverlayProvider, registerRemoteFileProvider } from './features/filesystem'
import { runAsync } from './utils'
import { DocumentMetadata } from './cucumber/fileMetadata'



buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers/', new URL('', window.location.href).href, false);

// Workers
export type WorkerLoader = () => Worker
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
  editorWorkerService: () => new (toCrossOriginWorker(EditorWorker))(),
  textMateWorker: () => new (toCrossOriginWorker(TextMateWorker))(),
  outputLinkComputer: () => new (toCrossOriginWorker(OutputLinkComputerWorker))(),
  languageDetectionWorkerService: () => new (toCrossOriginWorker(LanguageDetectionWorker))(),
}
window.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    const workerFactory = workerLoaders[label]
    if (workerFactory != null) {
      return workerFactory()
    }
    throw new Error(`Unimplemented worker ${label} (${moduleId})`)
  }
}

console.log('running setup')

// Override services
await initializeMonacoService({
  ...getExtensionServiceOverride(toWorkerConfig(ExtensionHostWorker)),
  ...getModelServiceOverride(),
  ...getNotificationServiceOverride(),
  ...getDialogsServiceOverride(),
  ...getConfigurationServiceOverride(monaco.Uri.file('/tmp')),
  ...getKeybindingsServiceOverride(),
  ...getTextmateServiceOverride(),
  ...getThemeServiceOverride(),
  ...getLanguagesServiceOverride(),
  ...getAudioCueServiceOverride(),
  ...getDebugServiceOverride(),
  ...getPreferencesServiceOverride(),
  ...getViewsServiceOverride(openNewCodeEditor),
  ...getSnippetServiceOverride(),
  ...getQuickAccessServiceOverride({
    isKeybindingConfigurationVisible: isEditorPartVisible,
    shouldUseGlobalPicker: isEditorPartVisible
  }),
  ...getOutputServiceOverride(),
  ...getTerminalServiceOverride(new TerminalBackend()),
  ...getSearchServiceOverride(),
  ...getMarkersServiceOverride(),
  ...getAccessibilityServiceOverride(),
  // ...getLanguageDetectionWorkerServiceOverride(),
  ...getStorageServiceOverride(),
})
StandaloneServices.get(ILogService).setLevel(LogLevel.Info)

export async function clearStorage(): Promise<void> {
  await (await getService(IStorageService) as BrowserStorageService).clear()
}

await initializeVscodeExtensions()

await registerLSPs()
getCucumberLangClient().onReady(registerRemoteFileProvider)


const suggestionProvider = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'red',
})

const knownStepDef = vscode.window.createTextEditorDecorationType({
  fontStyle: 'italic',
})

let documentMetadata = new DocumentMetadata()

vscode.commands.registerCommand('cucumber.addMetadata', (metadata: { pattern: string, argumentProviderMetadata?: { range: vscode.Range, provider: string }[] }) => {
  documentMetadata.addMetadata(metadata)
})

vscode.commands.registerCommand('cucumber.runStep', runStep)

vscode.workspace.onDidChangeTextDocument(event => {
  documentMetadata.update(event.document.uri, event.contentChanges)
})

getCucumberLangClient().onReady((client) => {
  const logsOutput = vscode.window.createOutputChannel('logs')
  client.onNotification('logs', (logs: any) => {
    logsOutput.appendLine(logs)
  })
})

registerViews()

for (const { part, element } of [
  { part: Parts.SIDEBAR_PART, element: '#sidebar' },
  { part: Parts.ACTIVITYBAR_PART, element: '#activityBar' },
  { part: Parts.PANEL_PART, element: '#panel' },
  { part: Parts.EDITOR_PART, element: '#editors' },
  { part: Parts.STATUSBAR_PART, element: '#statusBar' },
  { part: Parts.AUXILIARYBAR_PART, element: '#auxiliaryBar' }
]) {
  const el = document.querySelector<HTMLDivElement>(element)!
  attachPart(part, el)

  if (!isPartVisibile(part)) {
    el.style.display = 'none'
  }

  onPartVisibilityChange(part, visible => {
    el.style.display = visible ? 'block' : 'none'
  })
}
