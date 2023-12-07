import * as vscode from 'vscode'
import { createTreeItem } from './utils';
import { IExtensionContributions } from "vscode/dist/vscode/vs/platform/extensions/common/extensions";
import { getCucumberLangClient } from '../features/lsp';

//TODO: change for this to provide more flexibility? https://bendera.github.io/vscode-webview-elements/components/vscode-button/

export class StepDefinitionProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidchangeTreeData: vscode.EventEmitter<StepDefinition | undefined | null | void> = new vscode.EventEmitter<StepDefinition | undefined | null | void>()
    onDidChangeTreeData?: vscode.Event<void | StepDefinition | StepDefinition[] | null | undefined> | undefined = this._onDidchangeTreeData.event;

    private stepDefinitions: StepDefinition[] = []

    async fetchData() {
        const data = await getCucumberLangClient().languageClient?.sendRequest<StepDefinitionData[]>('cucumber/getStepDefinitions')
        if (data) {
            this.stepDefinitions = data?.map(it => new StepDefinition(it))
            this._onDidchangeTreeData.fire()
        }
    }

    getTreeItem(element: StepDefinition): vscode.TreeItem {
        return element
    }
    getChildren(element?: StepDefinition | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve(element.getArguments())
        } else {
            return Promise.resolve(this.stepDefinitions)
        }
    }

    refresh() {
        this.fetchData()
    }

    extensionContributions: IExtensionContributions = {
        commands: [
            {
                command: 'stepDefinitions.refresh',
                title: 'Refresh Step Definitions',
            }
        ],
        views: {
            'stepDefinitions': [
                {
                    id: 'stepDefinitions',
                    name: 'Step Definitions',
                }
            ]
        },
        menus: {
            'view/title': [
                {
                    command: 'stepDefinitions.refresh',
                    when: 'view == stepDefinitions',
                    group: 'navigation',
                }
            ]
        }
    }

}

export type StepDefinitionData = {
    pattern: string,
    location: string,
    args: {
        type: string,
        suggProvider: string
    }[],
    docs?: string,
    tags: string[]
}

export class StepDefinition extends vscode.TreeItem {

    constructor(private data: StepDefinitionData) {
        super(data.pattern, vscode.TreeItemCollapsibleState.Collapsed)
        this.iconPath = new vscode.ThemeIcon('outline-view-icon')
        this.tooltip = data.docs
    }



    getArguments(): vscode.TreeItem[] {
        return [
            createTreeItem(this.data.location, 'file'),
            ...this.data.args.map(({ type }) => createTreeItem(type, 'bracket'))
        ]
    }
}
