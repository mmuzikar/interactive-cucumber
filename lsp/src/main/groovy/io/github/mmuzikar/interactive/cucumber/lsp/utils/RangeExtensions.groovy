package io.github.mmuzikar.interactive.cucumber.lsp.utils

import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.Range

class RangeExtensions {

    // (10, 0) => (12, 0), (11, 4)
    // (10, 0) => (12, 0), (10, 4)
    // (10, 0) => (10, 6), (10, 4)
    static boolean contains(Range range, Position pos) {
        def lineMatches = range.start.line <= pos.line && range.end.line >= pos.line
        if (range.start.line != range.end.line) {
            if (pos.line == range.start.line) {
                return lineMatches && pos.character > range.start.character
            } else if (pos.line == range.end.line) {
                return lineMatches && pos.character < range.end.character
            }
            return lineMatches
        }
        return lineMatches && pos.character >= range.start.character && pos.character <= range.end.character
    }

}
