import { RegisteredFileSystemProvider, registerFileSystemOverlay, RegisteredMemoryFile, RegisteredReadOnlyFile, IFileSystemProviderWithFileReadWriteCapability, FileSystemProviderCapabilities, FileType, IFileChange, IFileDeleteOptions, IFileOverwriteOptions, IFileWriteOptions, IStat, IWatchOptions, RegisteredFile } from 'vscode/service-override/files'
import * as vscode from 'vscode'
import { CancellationToken } from 'vscode/dist/vscode/vs/base/common/cancellation'
import { Emitter, Event } from 'vscode/dist/vscode/vs/base/common/event'
import { DisposableStore, IDisposable } from 'vscode/dist/vscode/vs/base/common/lifecycle'
import { ReadableStreamEvents } from 'vscode/dist/vscode/vs/base/common/stream'
import { URI } from 'vscode/dist/vscode/vs/base/common/uri'
import { IFileReadStreamOptions, IFileOpenOptions } from 'vscode/dist/vscode/vs/platform/files/common/files'
import { MonacoLanguageClient } from 'monaco-languageclient/.'
import { IFileService, StandaloneServices } from 'vscode/services'

export const fileSystemProvider = new RegisteredFileSystemProvider(false)
export const outputFeatureFile = new RegisteredMemoryFile(vscode.Uri.file('/tmp/output.feature'), '')

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/tmp/test.feature'), `Given`))

fileSystemProvider.registerFile(outputFeatureFile)

fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.from({ scheme: 'user', path: '/settings.json' }), `
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
`))

registerFileSystemOverlay(1, fileSystemProvider)

export class RemoteFileSystemOverlayProvider implements IFileSystemProviderWithFileReadWriteCapability {
  capabilities: FileSystemProviderCapabilities = FileSystemProviderCapabilities.FileReadWrite
  _onDidChangeCapabilities = new vscode.EventEmitter<void>()
  onDidChangeCapabilities: Event<void> = this._onDidChangeCapabilities.event
  _onDidChangeFile = new vscode.EventEmitter<readonly IFileChange[]>()
  onDidChangeFile: Event<readonly IFileChange[]> = this._onDidChangeFile.event
  onDidWatchError?: Event<string> | undefined
  constructor(private client: MonacoLanguageClient) {

  }

  watch(resource: URI, opts: IWatchOptions): IDisposable {
    return {
      dispose() {

      },
    }
  }
  async stat(resource: URI): Promise<IStat> {
    try {
      return await this.client.sendRequest('files/stat', resource.toString())
    } catch (e) {
      throw vscode.FileSystemError.FileNotFound(resource)
    }
  }
  mkdir(resource: URI): Promise<void> {
    throw new Error('Method not implemented.')
  }
  readdir(resource: URI): Promise<[string, FileType][]> {
    return this.client.sendRequest('files/readDirectory', resource.toString())
  }
  delete(resource: URI, opts: IFileDeleteOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  copy?(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  readFileStream?(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array> {
    throw new Error('Method not implemented.')
  }
  open?(resource: URI, opts: IFileOpenOptions): Promise<number> {
    throw new Error('Method not implemented.')
  }
  close?(fd: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
  read?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number> {
    throw new Error('Method not implemented.')
  }
  write?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number> {
    throw new Error('Method not implemented.')
  }
  cloneFile?(from: URI, to: URI): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async readFile(resource: URI): Promise<Uint8Array> {
    const bytes: number[] = await this.client.sendRequest('files/readFile', resource.toString())
    return Uint8Array.from(bytes)
  }
  writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }

}

export async function registerRemoteFileProvider(client: MonacoLanguageClient) {
  const provider = new RemoteFileSystemOverlayProvider(client)
  registerFileSystemOverlay(-1, new RemoteFileSystemOverlayProvider(client))
  StandaloneServices.get(IFileService).registerProvider('remote', provider)
  try {
    vscode.workspace.updateWorkspaceFolders(1, null, {
      uri: vscode.Uri.parse('remote:/'),
      name: 'remote'
    })
  } catch (e) {
    console.log(e)
  }

}