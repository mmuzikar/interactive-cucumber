import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { ViewContainerLocation, registerCustomView } from "vscode/service-override/views";
import { StepDefinition, StepDefinitionData } from "./stepDefinitions";
import { runAsync } from "../utils";
import { getCucumberLangClient } from "../features/lsp";
import { TreeItem, VscodeTree } from "@bendera/vscode-webview-elements/dist/vscode-tree/vscode-tree";
import { codiconStyles, getIconURL } from "./components/icons";

import {fuzzyFilter, fuzzyMatch} from 'fuzzbunny'

function groupBy<T, K>(list: T[], keyGetter: ((it: T) => K)): Map<K, T[]> {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

@customElement('step-finder')
class StepFinder extends LitElement {

    static get styles() {
        return [css`
        step-finder {
            display: block;
        }

        vscode-tree {
            height: 500px;
            overflow-y: scroll;
        }

        ::-webkit-scrollbar {
            width: 10px;
        }

    `, codiconStyles]
    }

    @state()
    mode: 'All' | 'Tags' | 'Classes' = 'All'

    @state()
    search: string = ''

    @state()
    stepDefinitions?: StepDefinitionData[]

    @state()
    data: TreeItem[] = []

    connectedCallback(): void {
        super.connectedCallback()
        runAsync(async () => {
            this.stepDefinitions = await getCucumberLangClient().languageClient?.sendRequest<StepDefinitionData[]>('cucumber/getStepDefinitions')
        })
    }

    changeMode(e: any) {
        this.mode = e.detail.value
    }

    changeSearch(e : any) {
        this.mode = 'All'
        this.search = e.target.value
    }

    stepDefToEntry(s: StepDefinitionData): TreeItem {
        return {
            label: s.pattern,
            icons: {branch: 'symbol-method', open: 'symbol-method'},
            subItems: [
                {
                    label: s.location,
                    icons: { leaf: 'references' },
                    description: 'Location',
                },
                {
                    label: 'Parameters',
                    subItems: s.args.map(arg => ({
                        label: arg.type,
                        decorations: arg.suggProvider ? [{ appearance: "filled-circle", visibleWhen: 'always' }] : [],
                        icons: {leaf: 'symbol-snippet'}
                    })),
                    icons: { branch: 'symbol-parameter', open: 'symbol-parameter' }
                }
            ]
        }
    }

    createTree() {
        if (this.stepDefinitions) {
            const stepDefinitions = fuzzyFilter(this.stepDefinitions, this.search, {fields: ['pattern', 'docs', 'tags', 'location']}).map(item => item.item)

            console.log(stepDefinitions)

            switch (this.mode) {
                case 'All':
                    this.data = stepDefinitions.map(this.stepDefToEntry);
                    break

                case 'Tags': {
                    const map = new Map<string, StepDefinitionData[]>()
                    stepDefinitions.forEach(sd => {
                        sd.tags.forEach(tag => {
                            if (!map.get(tag)) {
                                map.set(tag, [])
                            }
                            map.get(tag)!.push(sd)
                        })
                    })
                    let data: TreeItem[] = []
                    for (const [tag, definitions] of map.entries()) {
                        data.push({
                            label: tag,
                            subItems: definitions.map(this.stepDefToEntry)
                        })
                    }
                    this.data = data
                }
                    break

                case 'Classes': {
                    const groups = groupBy(stepDefinitions, it => it.location.split('#')[0])
                    let data: TreeItem[] = []
                    for (const [clazz, definitions] of groups.entries()) {
                        data.push({
                            label: clazz,
                            subItems: definitions.map(this.stepDefToEntry)
                        })
                    }
                    this.data = data
                }
                    break
            }

            (this.renderRoot.querySelector('#stepfinder-tree')! as VscodeTree).data = this.data
        }
    }

    render() {
        this.createTree()
        return html`
            <vscode-form-container>
                <vscode-form-group>
                    <vscode-label for='mode-select'>Category: </vscode-label>
                    <vscode-single-select name='mode-select' value=${this.mode} @vsc-change=${this.changeMode}>
                        <vscode-option description='Show all step definitions without order'>All</vscode-option>
                        <vscode-option description='Order step definitions by tags'>Tags</vscode-option>
                        <vscode-option description='Order step definitions by classes'>Classes</vscode-option>
                    </vscode-single-select>
                    <vscode-textfield placeholder='Search for step definitions' value=${this.search} @vsc-input=${this.changeSearch}>
                        <vscode-icon slot='content-before' name='search' title='search'></vscode-icon>
                    </vscode-textfield>
                </vscode-form-group>
                <vscode-form-group>
                    <vscode-tree id="stepfinder-tree"></vscode-tree>
                </vscode-form-group>
            </vscode-form-container>
        `
    }
}



export function registerStepFinder() {
    registerCustomView({
        id: 'stepdef-finder',
        location: ViewContainerLocation.AuxiliaryBar,
        name: 'Step definition finder',
        icon: getIconURL('symbol-event'),
        renderBody(container) {
            container.style.display = 'block'

            container.innerHTML = '<step-finder></step-finder>'

            return {
                dispose() {
                }
            }

        }
    })
} 