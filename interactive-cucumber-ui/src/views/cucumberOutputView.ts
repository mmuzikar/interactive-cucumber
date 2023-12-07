import { ViewContainerLocation, registerCustomView } from "vscode/service-override/views";
import { outputFeature } from '../cucumber/stepRunner'
import * as vscode from 'vscode'
import { VscodeCheckbox, VscodeFormContainer, VscodeFormGroup, VscodeIcon } from '@bendera/vscode-webview-elements'

import { LitElement, css, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { when } from 'lit/directives/when.js'
import { customElement, property, state } from 'lit/decorators.js'
import { InteractiveFeature } from "../cucumber/interactiveFeatureFile";
import { getIconURL } from "./components/icons";

@customElement('scenario-output')
class ScenarioOutputElement extends LitElement {

    @property({ type: Boolean })
    private includeFailures: boolean = true

    private changeIncludeFailures(e: Event) {
        this.includeFailures = !this.includeFailures
    }


    render() {
        return html`
            <div>
                <h3>Scenario output</h3>
            <vscode-form-container>
                <vscode-form-group>
                    <vscode-checkbox label="Include failures" name="includeFailures" ?checked="${this.includeFailures}" @vsc-change=${this.changeIncludeFailures}></vscode-checkbox>
                </vscode-form-group>
                <hr/>
                <vscode-form-group>
                    <scenario-wrapper ?includeFailures=${this.includeFailures}></scenario-wrapper>
                </vscode-form-group>
            </vscode-form-container>
    </div>
        `
    }
}

@customElement('step-output')
class StepOutput extends LitElement {

    static styles = css`
        .running {
            color: rgb(175, 165, 29);
        }
        .passed {
            color: rgb(125, 151, 80);
        }
        .failed {
            color: rgb(179, 46, 23);
        }

        .running::marker {
            content: '⏱';
        }

        .passed::marker {
            content: '✓';
        }

        .failed::marker {
            content: 'x';
        }
        li {
            padding-left: 5px;
        }

        .step-buttons {
            color: unset;
        }

        .args > span {
            display: block;
            line-height: 15px;
        }
    `
    @property()
    index!: string

    @property()
    result!: 'passed' | 'failed' | 'running'

    @property()
    step!: string

    @property()
    error?: string

    async clickEdit() {
        let editor = vscode.window.activeTextEditor
        if (editor) {
            let document = editor.document
            if (!document.fileName.endsWith('.feature')) {
                document = await vscode.workspace.openTextDocument('/tmp/test.feature')
                editor = await vscode.window.showTextDocument(document)
            }
            const startPosition = new vscode.Position(document.lineCount + 2, 0)
            const lines = this.step.split('\n')
            editor.edit(builder => builder.insert(startPosition, '\n' + this.step))
            editor.revealRange(new vscode.Range(startPosition, new vscode.Position(lines.length + startPosition.line, lines[lines.length - 1].length)))
            outputFeature.removeStep(this.index)
        }
    }

    clickDelete() {
        outputFeature.removeStep(this.index)
        this.requestUpdate()
    }

    getIconLabel() {
        switch (this.result) {
            case 'failed':
                return 'error';
            case 'passed':
                return 'pass';
            case "running":
                return 'loading'
        }
    }

    render() {
        const [step, ...args] = this.step.split('\n')
        return html`
            <li class=${this.result}><span>${step}</span>
            <span class='step-buttons'>
                <button-icon label="edit" name="edit" @vsc-click="${this.clickEdit}"></button-icon>
                <button-icon label="delete" name="trash" @vsc-click="${this.clickDelete}"></button-icon>
            </span>
            ${args ? html`
            <div class="args">
                ${args.map(line => html`<span>${line}</span>`)}
            </div>
            ` : html``}
        </li>
        `
    }
}

@customElement('scenario-wrapper')
class ScenarioWrapper extends LitElement {

    @property({ attribute: false })
    feature: InteractiveFeature = outputFeature

    @property({ type: Boolean })
    includeFailures!: boolean

    constructor() {
        super()
        this.feature.listen(() => {
            this.requestUpdate('feature')
        })
    }

    getSteps() {
        const steps = this.feature.steps.filter(step => this.includeFailures ? true : step.result != 'failed')
        console.log({ steps }, this.includeFailures)
        return html`
            ${steps.map(step => html`<step-output index=${step.id} result=${step.result} step=${step.step} error=${ifDefined(step.error)}></step-output>`)}
        `
    }

    render() {
        console.log('rendering', this.feature)
        return html`
        ${when(this.feature.feature, () => html`<h3>Feature: ${this.feature.feature}</h3>`)}
        ${when(this.feature.scenario, () => html`<h4>Scenario: ${this.feature.scenario}</h4>`)}
        <ul>
            ${this.getSteps()}
        </ul>
        `

    }
}


export function registerScenarioOutput() {
    registerCustomView({
        id: 'cucumber-output',
        location: ViewContainerLocation.AuxiliaryBar,
        name: 'Scenario',
        icon: getIconURL('notebook'),
        renderBody: function (container: HTMLElement) {
            container.style.display = 'block'

            container.innerHTML = '<scenario-output></scenario-output>'

            return {
                dispose() {
                }
            }
        }
    })
}