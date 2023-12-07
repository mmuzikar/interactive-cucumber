import { MonacoLanguageClient, MonacoLanguageClientOptions } from "monaco-languageclient";
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { MessageTransports } from 'vscode-languageclient';
import { ExtensionHostKind, registerExtension } from "vscode/extensions";
import { IExtensionContributions, IRelaxedExtensionManifest } from "vscode/dist/vscode/vs/platform/extensions/common/extensions";

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import * as vscode from 'vscode'
import { CloseAction, ErrorAction } from 'vscode-languageclient'
import cucumberSyntaxUrl from '../syntaxes/cucumber.tmGrammar?url'
import javaSyntaxUrl from '../syntaxes/java.tmLanguage.json?url'
import { getCucumberExtensionContributions } from "../views/views";
import { JarFileSystemProvider, createProgressListeners, enableJavadocSymbols, initJavaLangFeatures } from "./java/javaExtension";


type OnReadyCallback = (client: MonacoLanguageClient) => void

export class RemoteLSP {
  languageClient?: MonacoLanguageClient
  callBacks = [] as OnReadyCallback[]
  constructor(private configuration: Omit<MonacoLanguageClientOptions, 'connectionProvider'>,
    private languageId: string,
    private url: string,
    private extensions: string[],
    private contributes?: IExtensionContributions,
    private extensionFiles?: { path: string, url: string }[]) {

  }

  onReady(callback: OnReadyCallback) {
    if (this.languageClient) {
      callback(this.languageClient)
    } else {
      this.callBacks.push(callback)
    }
  }

  private createWebSocket(): WebSocket {
    const webSocket = new WebSocket(this.url);
    webSocket.onopen = async () => {
      const socket = toSocket(webSocket);
      const reader = new WebSocketMessageReader(socket);
      const writer = new WebSocketMessageWriter(socket);
      this.languageClient = this.createLanguageClient({
        reader,
        writer
      });
      reader.onError(err => {
        console.error(err)
      })
      window.addEventListener('beforeunload', () => {
        console.log('before unload')
        if (this.languageClient?.isRunning()) {
          this.languageClient?.stop()
          this.languageClient?.dispose()
        }
        if (webSocket.readyState === webSocket.OPEN) {
          webSocket.close()
        }
        reader.dispose()
        writer.dispose()
        socket.dispose()

      })
      await this.languageClient.start();
      this.callBacks.forEach(it => it(this.languageClient!))
      this.callBacks = []
      reader.onClose(() => this.languageClient?.stop());
    };
    return webSocket;
  }

  private createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
    return new MonacoLanguageClient({
      ...this.configuration, connectionProvider: {
        get: () => {
          return Promise.resolve(transports);
        }
      }
    })
  }

  registerLSP() {
    const manifest = {
      name: this.configuration.name,
      publisher: 'interactive-cucumber-team',
      version: '1.0.0',
      engines: {
        vscode: "^1.81.0"
      }, contributes: {
        languages: [
          {
            id: this.languageId,
            aliases: [this.configuration.name],
            extensions: this.extensions
          }
        ],
        ...this.contributes
      }
    } satisfies IRelaxedExtensionManifest
    const result = registerExtension(manifest, ExtensionHostKind.LocalProcess)
    this.extensionFiles?.forEach(({ path, url }) => {
      result.registerFileUrl(path, url)
    })
    this.createWebSocket()
  }
}

const createUrl = (path: string, searchParams: Record<string, any> = {}, secure: boolean = location.protocol === 'https:'): string => {
  const protocol = secure ? 'wss' : 'ws';
  const host = window.location.host
  const url = new URL(`${protocol}://${host}${path}`);

  for (let [key, value] of Object.entries(searchParams)) {
    if (value instanceof Array) {
      value = value.join(',');
    }
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
};

let cucumberLSP: RemoteLSP
let javaLSP: RemoteLSP

export function getCucumberLangClient() {
  return cucumberLSP
}

export function getJavaLSP() {
  return javaLSP
}

async function createCucumberLSP() {
  cucumberLSP = new RemoteLSP({
    name: 'Cucumber',
    id: 'cucumber',
    clientOptions: {
      documentSelector: ['cucumber'],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart })
      },
      workspaceFolder: {
        index: 0,
        name: 'workspace',
        uri: monaco.Uri.parse('/tmp')
      },
      synchronize: {
        fileEvents: [vscode.workspace.createFileSystemWatcher('**')]
      }
    }
  }, 'cucumber', createUrl('/interactive-cucumber-server'), ['.feature'], {
    commands: [
      {
        command: "cucumber.runStep",
        title: "Run step"
      }
    ],
    keybindings: [
      {
        command: 'cucumber.runStep',
        key: "ctrl+enter"
      }
    ],
    grammars: [
      {
        language: 'cucumber',
        scopeName: 'source.ruby.rspec.cucumber.steps',
        path: '/syntaxes/cucumber.tmGrammar'
      } as any
    ],
    ...getCucumberExtensionContributions()
  }, [{ path: '/syntaxes/cucumber.tmGrammar', url: cucumberSyntaxUrl }])

  cucumberLSP.registerLSP()
}

async function registerJavaLSP() {
  javaLSP = new RemoteLSP({
    name: 'Java',
    id: 'java',
    clientOptions: {
      // Register the server for java documents
      documentSelector: [{ language: 'java' }],
      synchronize: {
        // Synchronize the setting section 'java' to the server
        // NOTE: this currently doesn't do anything
        configurationSection: 'java',
        // Notify the server about file changes to 'javaconfig.json' files contain in the workspace
        fileEvents: [
          vscode.workspace.createFileSystemWatcher('**/*.java')
        ]
      },
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart })
      },
      outputChannelName: 'Java',
      revealOutputChannelOn: 4 // never
    }
  }, 'java', createUrl('/java'), ['.java'], {
    grammars: [
      {
        language: 'java',
        scopeName: 'source.java',
        path: '/syntaxes/java.tmLanguage.json'
      } as any
    ],
    languages: [
      {
        id: 'java',
        extensions: [
          ".java"
        ],
        aliases: [
          "Java"
        ],
      }
    ],
    commands: [
      {
        command: 'java.executeBlock',
        title: 'Execute Java file',
        category: 'java',
        icon: '$(run)'
      } as any
    ],
    menus: {
      'editor/title': [
        {
          command: 'java.executeBlock',
          group: 'navigation',
          when: 'editorLangId == java'
        }
      ]
    },
    "configuration": {
      "title": "Java configuration",
      "properties": {
        "java.home": {
          "type": "string",
          "description": "Absolute path to your Java home directory"
        },
        "java.classPath": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Relative paths from workspace root to .jar files, .zip files, or folders that should be included in the Java class path"
        },
        "java.docPath": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Relative paths from workspace root to .jar files or .zip files containing source code, or to folders that should be included in the Java doc path"
        },
        "java.externalDependencies": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[^:]+:[^:]+:[^:]+(:[^:]+:[^:]+)?$"
          },
          "description": "External dependencies of the form groupId:artifactId:version or groupId:artifactId:packaging:version:scope"
        },
        "java.testMethod": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Command to run one test method, for example [\"mvn\", \"test\", \"-Dtest=${class}#${method}\""
        },
        "java.debugTestMethod": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Command to debug one test method, for example [\"mvn\", \"test\", \"-Dmaven.surefire.debug\", \"-Dtest=${class}#${method}\". The test should start paused, listening for the debugger on port 5005."
        },
        "java.testClass": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Command to run all tests in a class, for example [\"mvn\", \"test\", \"-Dtest=${class}\""
        },
        "java.addExports": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "List of modules to allow access to, for example [\"jdk.compiler/com.sun.tools.javac.api\"]"
        },
        "java.trace.server": {
          "scope": "window",
          "type": "string",
          "enum": [
            "off",
            "messages",
            "verbose"
          ],
          "default": "off",
          "description": "Traces the communication between VSCode and the language server."
        }
      }
    } as any,
    "configurationDefaults": {
      "[java]": {
        "editor.formatOnSave": true
      }
    },
  }, [{ path: '/syntaxes/java.tmLanguage.json', url: javaSyntaxUrl }])
  javaLSP.registerLSP()
  enableJavadocSymbols()
  vscode.workspace.registerTextDocumentContentProvider('jar', new JarFileSystemProvider());
  javaLSP.onReady(client => {
    initJavaLangFeatures(client)
    createProgressListeners(client)
  })
}


export async function registerLSPs() {
  await Promise.all([createCucumberLSP(), registerJavaLSP()])
}
