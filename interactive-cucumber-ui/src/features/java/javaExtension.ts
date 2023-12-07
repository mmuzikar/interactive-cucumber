import { MonacoLanguageClient } from "monaco-languageclient/.";
import { CancellationToken, IndentAction, Progress, ProgressLocation, ProviderResult, StatusBarAlignment, TextDocumentContentProvider, Uri, languages, window, workspace } from "vscode";
import * as vscode from 'vscode'
import { decoration } from "./textMate";

export function enableJavadocSymbols() {
	// Let's enable Javadoc symbols autocompletion, shamelessly copied from MIT licensed code at
	// https://github.com/Microsoft/vscode/blob/9d611d4dfd5a4a101b5201b8c9e21af97f06e7a7/extensions/typescript/src/typescriptMain.ts#L186
	languages.setLanguageConfiguration('java', {
		indentationRules: {
			// ^(.*\*/)?\s*\}.*$
			decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
			// ^.*\{[^}"']*$
			increaseIndentPattern: /^.*\{[^}"']*$/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
		onEnterRules: [
			{
				// e.g. /** | */
				beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
				afterText: /^\s*\*\/$/,
				action: { indentAction: IndentAction.IndentOutdent, appendText: ' * ' }
			},
			{
				// e.g. /** ...|
				beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
				action: { indentAction: IndentAction.None, appendText: ' * ' }
			},
			{
				// e.g.  * ...|
				beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
				action: { indentAction: IndentAction.None, appendText: '* ' }
			},
			{
				// e.g.  */|
				beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
				action: { indentAction: IndentAction.None, removeText: 1 }
			},
			{
				// e.g.  *-----*/|
				beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
				action: { indentAction: IndentAction.None, removeText: 1 }
			}
		]
	});
}

interface ProgressMessage {
	message: string
	increment: number
}

export function createProgressListeners(client: MonacoLanguageClient) {
	// Create a "checking files" progress indicator
	let statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 0);

	statusBar.text = ""
	statusBar.show()

	let progressListener = new class {
		progress: Progress<{ message: string, increment?: number }> | null = null
		resolve: ((nothing: {}) => void) | null = null

		startProgress(message: string) {
			if (this.progress != null)
				this.endProgress();

			window.withProgress({ title: message, location: ProgressLocation.Notification }, progress => new Promise((resolve, _reject) => {
				console.log('creating new progress', progress);

				progress.report({ message: "hello world" });

				this.progress = progress;
				this.resolve = resolve;
			}));
		}

		reportProgress(message: string, increment: number) {
			if (increment == -1)
				this.progress?.report({ message });
			else
				this.progress?.report({ message, increment })
		}

		endProgress() {
			if (this.progress != null) {
				this.resolve?.({});
				this.progress = null;
				this.resolve = null;
			}
		}
	}
	// Use custom notifications to drive progressListener
	client.onNotification('java/startProgress', (event: ProgressMessage) => {
		console.log('starting progress', event)
		statusBar.text = `$(server-process) Java LSP: ${event.message}`
		progressListener.startProgress(event.message);
	});
	client.onNotification('java/reportProgress', (event: ProgressMessage) => {
		console.log('reporting progress', event)
		statusBar.text = `$(server-process) Java LSP: ${event.message}`
		progressListener.reportProgress(event.message, event.increment);
	});
	client.onNotification('java/endProgress', () => {
		console.log('ending progress')
		statusBar.text = '$(smiley) Java LSP active'
		progressListener.endProgress();
	});

	const logsOutput = window.createOutputChannel('Java LSP')
	client.onNotification('logs', (logs: any) => {
		logsOutput.appendLine(logs)
	})
};

class RunBlockCodeLensProvider implements vscode.CodeLensProvider {
	onDidChangeCodeLenses?: vscode.Event<void> | undefined;
	constructor(private client: MonacoLanguageClient) {

	}

	async provideCodeLenses(document: vscode.TextDocument, token: CancellationToken): ProviderResult<vscode.CodeLens[]> {
		const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).text.length))
		return [
			new vscode.CodeLens(range, {
				title: "Run script",
				command: 'java.executeBlock',
				arguments: [document, range]
			})
		]
	}
}

function addImport(clazz: string) {
	const editor = vscode.window.activeTextEditor
	const document = editor?.document
	let importLine = `import ${clazz};\n`;
	if (editor && document) {
		const lines = document.getText().split('\n')
		const lineNum = lines.findIndex(line => {
			return /class \w+/g.test(line)
		})
		if (lineNum === 0) {
			importLine += '\n'
		}

		if (lines.find(line => line === importLine.trimEnd())) {
			return
		}

		editor.edit(builder => {
			builder.insert(new vscode.Position(Math.max(0, lineNum - 1), 0), importLine)
		})
	}
}

export function initJavaLangFeatures(client: MonacoLanguageClient) {
	vscode.commands.registerCommand('java.executeBlock', async (document: vscode.TextDocument | vscode.Uri, range: vscode.Range) => {
		if (document instanceof vscode.Uri) {
			document = await vscode.workspace.openTextDocument(document)
		}
		if (!(range instanceof Range)) {
			range = new vscode.Range(0, 0, document.lineCount, document.lineAt(document.lineCount - 1).text.length)
		}
		const block = document.getText(range)
		const resp: { state: string, data: any } = await client.sendRequest('jshell/eval', { script: block })
		if (resp.state === 'success') {
			window.showInformationMessage(resp.data ? 'Script output: ' + resp.data : 'Script executed successfully')
		} else {
			window.showErrorMessage(resp.data)
		}
	})

	vscode.commands.registerCommand('java.addImport', addImport)

	statics = window.createTextEditorDecorationType({
		fontStyle: 'italic'
	});
	languages.registerCodeLensProvider({ language: 'java' }, new RunBlockCodeLensProvider(client))

	client.onNotification('java/colors', cacheSemanticColors)
	window.onDidChangeVisibleTextEditors(applySemanticColors)
	workspace.onDidCloseTextDocument(forgetSemanticColors)
	workspace.onDidChangeConfiguration(onChangeConfiguration)

	client.onNotification('jshell/inspect', (data: any) => {
		console.log('inspect', data)
	})
}


// Allows VSCode to open files like jar:file:///path/to/dep.jar!/com/foo/Thing.java
export class JarFileSystemProvider implements TextDocumentContentProvider {
	provideTextDocumentContent(uri: Uri, _token: CancellationToken): ProviderResult<string> {
		const { zip, file } = this.splitZipUri(uri);
		console.log(`Reading ${zip} ${file}`)
		return this.readZip(zip, file);
	}
	private splitZipUri(uri: Uri): { zip: string, file: string } {
		const path = uri.fsPath.substring("file://".length);
		const [zip, file] = path.split('!/');
		return { zip, file };
	}
	private async readZip(zip: string, file: string): Promise<string> {
		const data = await workspace.fs.readFile(Uri.from({ scheme: 'remote', path: zip, query: file }))
		return data.toString()
	}
}


interface SemanticColors {
	uri: string;
	fields: vscode.Range[];
	statics: vscode.Range[];
}

function asRange(r: vscode.Range) {
	return new vscode.Range(asPosition(r.start), asPosition(r.end));
}
function asPosition(p: vscode.Position) {
	return new vscode.Position(p.line, p.character);
}
let statics: vscode.TextEditorDecorationType
const colors = new Map<string, SemanticColors>();
function cacheSemanticColors(event: SemanticColors) {
	colors.set(event.uri, event);
	applySemanticColors();
}
function applySemanticColors() {
	for (const editor of window.visibleTextEditors) {
		if (editor.document.languageId != 'java') continue;
		const c = colors.get(editor.document.uri.toString());
		if (c == null) {
			console.warn('No semantic colors for ' + editor.document.uri)
			continue;
		}
		function decorate(scope: string, ranges: vscode.Range[]) {
			const d = decoration(scope);
			if (d == null) {
				console.warn(scope + ' is not defined in the current theme');
				return;
			}
			editor.setDecorations(d, ranges.map(asRange));
		}
		decorate('variable', c.fields);
		editor.setDecorations(statics, c.statics.map(asRange));
	}
}
function forgetSemanticColors(doc: vscode.TextDocument) {
	colors.delete(doc.uri.toString());
}
// Load active color theme
async function onChangeConfiguration(event: vscode.ConfigurationChangeEvent) {
	let colorizationNeedsReload: boolean = event.affectsConfiguration('workbench.colorTheme')
		|| event.affectsConfiguration('editor.tokenColorCustomizations')
	if (colorizationNeedsReload) {
		applySemanticColors()
	}
}