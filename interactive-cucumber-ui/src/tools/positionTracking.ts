import { uid } from 'uid'
import * as vscode from 'vscode'

//Based on https://github.com/srares13/vscode-position-tracking, some internal changes had to be made to make it work for my use case

/**
 * @param {vscode.TextDocumentContentChangeEvent[]} changes
 * @param {vscode.Range[]} toUpdateRanges
 * @param {vscode.Range[]} updatedRanges
 */
/*
function debugLogsOnDebugConsole(changes : vscode.TextDocumentChangeEvent[], toUpdateRanges : vscode.Range[], updatedRanges : vscode.Range[]) {
   console.log(`-------------------`)
   console.log(`-------------------`)

   console.log(`Change ranges`)
   for (const change of changes) {
      console.log(`    start: ${change.range.start.line} ${change.range.start.character}`)
      console.log(`    end: ${change.range.end.line} ${change.range.end.character}`)
      console.log(`    -----`)
   }

   console.log('To update ranges')
   for (const range of toUpdateRanges) {
      console.log(`    start: ${range.start.line} ${range.start.character}`)
      console.log(`    end: ${range.end.line} ${range.end.character}`)
      console.log(`    -----`)
   }

   console.log('Updated ranges')
   for (const range of updatedRanges) {
      console.log(`    start: ${range.start.line} ${range.start.character}`)
      console.log(`    end: ${range.end.line} ${range.end.character}`)
      console.log(`    -----`)
   }
}*/

/**
 * @param {vscode.TextDocumentContentChangeEvent[]} changes
 * @param {vscode.Range[]} toUpdateRanges
 * @param {vscode.Range[]} updatedRanges
 * @param {vscode.OutputChannel} outputChannel
 */
/*
function debugLogsOnExtensionChannel(changes, toUpdateRanges, updatedRanges, outputChannel) => {
   outputChannel.appendLine(`-------------------`)
   outputChannel.appendLine(`-------------------`)

   outputChannel.appendLine(`Change ranges`)
   for (const change of changes) {
      outputChannel.appendLine(
         `    start: ${change.range.start.line} ${change.range.start.character}`
      )
      outputChannel.appendLine(`    end: ${change.range.end.line} ${change.range.end.character}`)
      outputChannel.appendLine(`    -----`)
   }

   outputChannel.appendLine('To update ranges')
   for (const range of toUpdateRanges) {
      outputChannel.appendLine(`    start: ${range.start.line} ${range.start.character}`)
      outputChannel.appendLine(`    end: ${range.end.line} ${range.end.character}`)
      outputChannel.appendLine(`    -----`)
   }

   outputChannel.appendLine('Updated ranges')
   for (const range of updatedRanges) {
      outputChannel.appendLine(`    start: ${range.start.line} ${range.start.character}`)
      outputChannel.appendLine(`    end: ${range.end.line} ${range.end.character}`)
      outputChannel.appendLine(`    -----`)
   }
}*/

/**
 * @param {vscode.Position} position
 * @param {vscode.TextDocumentContentChangeEvent} change
 */
function getUpdatedPosition(position: vscode.Position, change: vscode.TextDocumentContentChangeEvent) {
    let newLine = position.line
    let newCharacter = position.character

    // change before position-to-update
    if (change.range.end.isBeforeOrEqual(position)) {
        // change consisted in deletion
        if (!change.range.start.isEqual(change.range.end)) {
            // change range is also on the position-to-update's line
            if (change.range.end.line === newLine) {
                const characterDelta = change.range.end.character - change.range.start.character
                newCharacter -= characterDelta
            }

            const lineDelta = change.range.end.line - change.range.start.line
            newLine -= lineDelta
        }

        // change consisted in insertion
        if (change.text) {
            // insertion is on the same line as the position-to-update
            if (change.range.start.line === newLine) {
                // the insertion has at least one new line
                if (change.text.split('\n').length - 1 > 0) {
                    newCharacter -= change.range.start.character

                    const index = change.text.lastIndexOf('\n')
                    newCharacter += change.text.slice(index + 1, change.text.length).length

                    // the insertion has no new lines
                } else {
                    newCharacter += change.text.length
                }
            }

            newLine += change.text.split('\n').length - 1
        }
    }

    return new vscode.Position(newLine, newCharacter)
}

export type onDeletion = 'remove' | 'shrink'
export type onAddition = 'remove' | 'extend' | 'split'
export type Options = {
    onDeletion?: onDeletion,
    onAddition?: onAddition,
    debugConsole?: boolean,
    outputChannel?: vscode.OutputChannel
}

export type TrackedRange<T> = {
    type: string,
    id: string,
    range: vscode.Range,
    data?: T
}

export function getUpdatedRanges<T>(ranges: TrackedRange<T>[], changes: readonly vscode.TextDocumentContentChangeEvent[], options?: Options) : TrackedRange<T>[] {
    let toUpdateRanges: (TrackedRange<T> | null)[] = [...ranges]

    // Sort all changes in order so that the first one is the change that's the closest to
    // the end of the document, and the last one is the change that's the closest to
    // the begining of the document.
    const sortedChanges = [...changes].sort((change1, change2) =>
        change2.range.start.compareTo(change1.range.start)
    )

    let onDeletion = undefined
    let onAddition = undefined
    let debugConsole = undefined
    let outputChannel = undefined
    if (options) {
        ; ({ onDeletion, onAddition, debugConsole, outputChannel } = options)
    }
    if (!onDeletion) {
        onDeletion = 'shrink'
    }
    if (!onAddition) {
        onAddition = 'extend'
    }

    for (const change of sortedChanges) {
        for (let i = 0; i < toUpdateRanges.length; i++) {
            if (!toUpdateRanges[i]) {
                continue
            }

            if (toUpdateRanges[i] != null) {
                const range = toUpdateRanges[i]!.range
                if (
                    change.range.intersection(range) &&
                    !change.range.end.isEqual(range.start) &&
                    !change.range.start.isEqual(range.end)
                ) {
                    if (!change.range.start.isEqual(change.range.end)) {
                        if (onDeletion === 'remove') {
                            toUpdateRanges[i] = null
                        } else if (onDeletion === 'shrink') {
                            let newRangeStart = range.start
                            let newRangeEnd = range.end

                            if (change.range.contains(range.start)) {
                                newRangeStart = change.range.end
                            }

                            if (change.range.contains(range.end)) {
                                newRangeEnd = change.range.start
                            }

                            if (newRangeEnd.isBefore(newRangeStart)) {
                                toUpdateRanges[i] = null
                            } else {
                                toUpdateRanges[i] = { range: new vscode.Range(newRangeStart, newRangeEnd), data: toUpdateRanges[i]?.data, id: toUpdateRanges[i]!.id, type: toUpdateRanges[i]!.type }
                            }
                        }
                    }
                }
            }

            if (!toUpdateRanges[i]) {
                continue
            }

            if (
                change.range.intersection(toUpdateRanges[i]!.range) &&
                !change.range.end.isEqual(toUpdateRanges[i]!.range.start) &&
                !change.range.start.isEqual(toUpdateRanges[i]!.range.end)
            ) {
                if (change.text) {
                    if (onAddition === 'remove') {
                        toUpdateRanges[i] = null
                    } else if (onAddition === 'split') {
                        toUpdateRanges.splice(
                            i + 1,
                            0,
                            { range: new vscode.Range(change.range.start, toUpdateRanges[i]!.range.end), data: toUpdateRanges[i]?.data, id: uid(), type: toUpdateRanges[i]!.type }
                        )
                        toUpdateRanges[i] = { range: new vscode.Range(toUpdateRanges[i]!.range.start, change.range.start), data: toUpdateRanges[i]?.data, id: toUpdateRanges[i]!.id, type: toUpdateRanges[i]!.type }
                    }
                }
            }

            if (!toUpdateRanges[i]) {
                continue
            }

            const updatedRangeStart = getUpdatedPosition(toUpdateRanges[i]!.range.start, change)
            let updatedRangeEnd = undefined

            if (
                !toUpdateRanges[i]!.range.start.isEqual(toUpdateRanges[i]!.range.end) &&
                toUpdateRanges[i]!.range.end.isEqual(change.range.end)
            ) {
                updatedRangeEnd = toUpdateRanges[i]!.range.end
            } else {
                updatedRangeEnd = getUpdatedPosition(toUpdateRanges[i]!.range.end, change)
            }

            toUpdateRanges[i] = { range: new vscode.Range(updatedRangeStart, updatedRangeEnd), data: toUpdateRanges[i]?.data, id: toUpdateRanges[i]!.id, type: toUpdateRanges[i]!.type }
        }
    }

    for (let i = 0; i < toUpdateRanges.length - 1; i++) {
        if (!toUpdateRanges[i]) {
            continue
        }

        for (let j = i + 1; j < toUpdateRanges.length; j++) {
            if (!toUpdateRanges[j]) {
                continue
            }

            if (
                toUpdateRanges[i]!.range.end.isEqual(toUpdateRanges[j]!.range.start) ||
                toUpdateRanges[i]!.range.start.isEqual(toUpdateRanges[j]!.range.end)
            ) {
                if (toUpdateRanges[j]!.range.start.isEqual(toUpdateRanges[j]!.range.end)) {
                    toUpdateRanges[j] = null
                } else if (toUpdateRanges[i]!.range.start.isEqual(toUpdateRanges[i]!.range.end)) {
                    toUpdateRanges[i] = null
                }
            }
        }
    }

    const updatedRanges = toUpdateRanges.filter((range) => range)

    // debugConsole && debugLogsOnDebugConsole(sortedChanges, ranges, updatedRanges)
    //    outputChannel && debugLogsOnExtensionChannel(sortedChanges, ranges, updatedRanges, outputChannel)

    return updatedRanges as any
}
