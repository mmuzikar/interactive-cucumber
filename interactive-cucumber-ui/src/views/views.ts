import * as vscode from 'vscode'

import { FeaturesTreeView, HasTextContent } from "./featuresTreeView"
import { StepDefinitionProvider } from "./stepDefinitions"
import { deepmerge } from "deepmerge-ts";
import { registerScenarioOutput } from './cucumberOutputView';
import { getCucumberLangClient } from '../features/lsp';
import { VscodeButton, VscodeCheckbox, VscodeFormContainer, VscodeFormGroup, VscodeTree } from '@bendera/vscode-webview-elements';

import "./components/icons"
import { registerStepFinder } from './stepFinder';

export const stepDefinitionProvider = new StepDefinitionProvider()
export const featureTreeView = new FeaturesTreeView()

function registerElement(name: string, element: CustomElementConstructor) {
    if (!customElements.get(name)) {
        customElements.define(name, element)
    }
}

function registerVScodeElements() {
        const customElements = {
            'vscode-checkbox': VscodeCheckbox,
            'vscode-form-container': VscodeFormContainer,
            'vscode-tree': VscodeTree,
            'vscode-button': VscodeButton,
            'vscode-form-group': VscodeFormGroup,
        }

        Object.entries(customElements).forEach(([name, element]) => registerElement(name, element))
}

export function registerViews() {
    registerVScodeElements()
    getCucumberLangClient().onReady(() => {
        vscode.window.registerTreeDataProvider('stepDefinitions', stepDefinitionProvider)
        vscode.window.registerTreeDataProvider('features', featureTreeView)
        stepDefinitionProvider.refresh()
        featureTreeView.refresh()
    })

    vscode.commands.registerCommand('stepDefinitions.refresh', () => {
        stepDefinitionProvider.refresh()
    })
    vscode.commands.registerCommand('features.refresh', () => {
        featureTreeView.refresh()
    })

    vscode.commands.registerCommand('features.sendToEditor', (data: any) => {
        const text = (data as HasTextContent)?.getText()
        const editor = vscode.window.activeTextEditor
        if (editor) {
            editor.edit(builder => {
                builder.insert(editor.selection.end, '\n' + text)
            })
        }
    })

    registerScenarioOutput()
    registerStepFinder()
}

export function getCucumberExtensionContributions() {
    const contributions = deepmerge(stepDefinitionProvider.extensionContributions, featureTreeView.extensionContributions)
    console.log(contributions)
    return contributions
}