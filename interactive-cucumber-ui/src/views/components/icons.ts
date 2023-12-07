import { unsafeCSS } from 'lit'

import codiconStylesSrc from '@vscode/codicons/dist/codicon.css?inline'
import { VscodeIcon } from '@bendera/vscode-webview-elements'
import { customElement } from 'lit/decorators.js'


export const codiconStyles = unsafeCSS(codiconStylesSrc)

@customElement('my-icon')
export class CustomIcon extends VscodeIcon {

    static get styles () {
        return [codiconStyles, VscodeIcon.styles ]
    }
}

@customElement('button-icon')
export class ButtonIcon extends CustomIcon {
    constructor() {
        super()
        this.actionIcon = true
    }
}

export function getIconURL(name: string) {
    return new URL(`assets/icons/${name}.svg`, window.location.href).toString()
}