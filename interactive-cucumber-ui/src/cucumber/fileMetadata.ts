import { getCucumberLangClient } from "../features/lsp"
import { TrackedRange, getUpdatedRanges } from "../tools/positionTracking"
import { TextDocumentContentChangeEvent, Uri, Range, window } from "vscode"

import objectHash from 'object-hash'
import { uid } from "uid"

type DocumentMetadataItem = {
    uri: Uri

    argumentProviderRanges: TrackedRange<string>[]
    knownStepDefinitions: TrackedRange<string>[]

}

export class DocumentMetadata {
    
    documents : Record<string, DocumentMetadataItem> = {}
    
    constructor() {
    }

    createDocument(uri: Uri) {
        this.documents[uri.toString()] = {
            uri: uri,
            argumentProviderRanges: [],
            knownStepDefinitions: [],
        }
    }

    calculateHashes(metadata: DocumentMetadataItem) {
        return [objectHash(metadata.argumentProviderRanges), objectHash(metadata.knownStepDefinitions)] as const
    }

    private sendUpdateToClient(uri: Uri) {
        const metadata = this.documents[uri.toString()]
        getCucumberLangClient().languageClient?.sendNotification('cucumber/documentMetadata', {
            uri: uri.toString(),
            argumentProviderRanges: metadata.argumentProviderRanges,
            knownStepDefinitions: metadata.knownStepDefinitions
        })
    }

    update(uri :Uri, contentChanges: readonly TextDocumentContentChangeEvent[]) {
        if (!this.documents[uri.toString()]) {
            this.createDocument(uri)
        }
        const metadata = this.documents[uri.toString()]
        const prevHashes = this.calculateHashes(metadata)
        metadata.argumentProviderRanges = getUpdatedRanges(metadata.argumentProviderRanges, contentChanges, { onDeletion: 'remove' })
        metadata.knownStepDefinitions = getUpdatedRanges(metadata.knownStepDefinitions, contentChanges, { onDeletion: 'remove' })
        const newHashes = this.calculateHashes(metadata)

        const same = prevHashes.map((val, i) => {
            return val === newHashes[i]
        }).reduce((prev, next) => prev && next)

        if (!same) {
            this.sendUpdateToClient(metadata.uri)
        }
    }

    addMetadata(metadata: { pattern: string, argumentProviderMetadata?: { range: Range, provider: string }[] }) {
        const editor = window.activeTextEditor
        if (editor) {
          const uri = editor.document.uri
          const documentMetadata = this.documents[uri.toString()]
          const line = editor.selection.start.line
          const lineRange = editor.document.lineAt(line).range
      
      
          documentMetadata.knownStepDefinitions.push({ range: lineRange, data: metadata.pattern, id: uid(), type: 'StepDefinition' })
          metadata.argumentProviderMetadata?.forEach(({ range, provider }) => {
            const line = editor.selection.start.line
            const lineRange = new Range(line, range.start.character - 1, line, range.end.character)
            documentMetadata.argumentProviderRanges.push({ range: lineRange, data: provider, id: uid(), type: 'ArgumentProvider' })
          })
          this.sendUpdateToClient(uri)
        }
    }
}