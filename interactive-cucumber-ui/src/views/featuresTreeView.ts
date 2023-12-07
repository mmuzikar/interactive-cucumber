import * as vscode from 'vscode'
import { createTreeItem } from './utils';
import { IExtensionContributions } from 'vscode/extensions';
import { getCucumberLangClient } from '../features/lsp';

export class FeaturesTreeView implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<void | vscode.TreeItem | vscode.TreeItem[] | null | undefined> = new vscode.EventEmitter()
    onDidChangeTreeData?: vscode.Event<void | vscode.TreeItem | vscode.TreeItem[] | null | undefined> | undefined = this._onDidChangeTreeData.event;

    private features: Feature[] = []

    async fetchData() {
        const features = await getCucumberLangClient().languageClient?.sendRequest<FeatureData[]>('cucumber/getFeatures')
        console.log(features)
        if (features) {
            this.features = features.map(data => new Feature(data))
            this._onDidChangeTreeData.fire()
        }

    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element
    }

    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve((element as HasChildren)?.getChildren())
        } else {
            return Promise.resolve(this.features)
        }
    }

    refresh() {
        this.fetchData()
    }

    extensionContributions: IExtensionContributions = {
        commands: [
            {
                command: 'features.refresh',
                title: 'Refresh Feature View'
            },
            {
                command: 'features.sendToEditor',
                title: 'Send to editor',
            }
        ],
        views: {
            'features': [
                {
                    id: 'features',
                    name: 'Features'
                }
            ]
        },
        menus: {
            'view/title': [
                {
                    command: 'features.refresh',
                    when: 'view == features',
                    group: 'navigation',
                }
            ],
            'view/item/context': [
                {
                    group: 'inline',
                    when: 'view == features && viewItem == hasText',
                    command: 'features.sendToEditor'
                }
            ]
        }
    }
}

class Scenario extends vscode.TreeItem implements HasChildren, HasTextContent {
    private steps: Step[]

    constructor(private data: ScenarioData) {
        super(data.name, vscode.TreeItemCollapsibleState.Collapsed)
        this.steps = data.steps.map(data => new Step(data))
        this.iconPath = new vscode.ThemeIcon('beaker')
        this.contextValue = 'hasText'
    }

    getChildren(): vscode.TreeItem[] {
        return this.steps
    }

    getText(): string {
        return `
${this.data.tags.join(' ')}
Scenario: ${this.data.name}
\t${this.steps.map(s => s.getText()).join('\n\t')}
        `
    }
}

class Step extends vscode.TreeItem implements HasTextContent {
    constructor(private data: StepData) {
        super(data.step)
        this.iconPath = new vscode.ThemeIcon('symbol-constant')
        this.contextValue = 'hasText'

    }

    getText(): string {
        return this.data.step
    }

}

type StepData = {
    step: string, line: number
}
type ScenarioData = {
    name: string, tags: string[], steps: StepData[]
}
type FeatureData = {
    uri: string, name: string, scenarios: ScenarioData[]
}

class Feature extends vscode.TreeItem implements HasChildren, HasTextContent {
    scenarios: Scenario[]

    constructor(private data: FeatureData) {
        super(data.name, vscode.TreeItemCollapsibleState.Collapsed)
        this.scenarios = data.scenarios.map(it => new Scenario(it))
        this.contextValue = 'hasText'
    }

    getChildren(): vscode.TreeItem[] {
        return [
            createTreeItem(this.data.uri, 'file'),
            ...this.scenarios
        ]
    }

    getText(): string {
        return `
Feature: ${this.data.name}

\t${this.scenarios.map(s => s.getText()).join('\n\t')}
        `.trim()
    }
}

interface HasChildren {
    getChildren(): vscode.TreeItem[]
}

export interface HasTextContent {
    getText() : string
}