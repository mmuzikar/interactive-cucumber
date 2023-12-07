package io.github.mmuzikar.interactive.cucumber.lsp.storage

import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification

import com.google.gson.JsonObject

import io.github.mmuzikar.interactive.cucumber.lsp.utils.RangeExtensions

class FileSystem {
    private Map<String, String> files = [:]
    private Map<String, Map<String, DocumentMetadata>> metadata = [:]

    String getLine(String uri, Position position) {
        return getLine(uri, position.line)
    }

    String getLine(String uri, int lineNum) {
        def source = files[uri]
        return source.readLines()[lineNum] ?: ''
    }

    String getText(String uri) {
        return files[uri]
    }

    String getWordUntilPosition(String line, Position position) {
        //TODO:
        throw new UnsupportedOperationException()
    }

    void updateDocument(String uri, String text) {
        files[uri] = text
    }

    void updateMetadata(String uri, List<DocumentMetadata> metadata) {
        Map<String, DocumentMetadata> newMetadata = metadata.collectEntries {
            [(it.id): it]
        }
        this.metadata[uri] = newMetadata
    }

    DocumentMetadata[] getMetadata(String uri, int line) {
        Optional.ofNullable(metadata[uri]).map { data ->
            return data.values().findAll {
                def range = it.range
                line >= range.start.line && line <= range.end.line
            }
        }.orElse([]) as DocumentMetadata[]
    }

    DocumentMetadata[] getMetadata(String uri, Position pos) {
        Optional.ofNullable(metadata[uri]).map { data ->
            return data.values().findAll {
                RangeExtensions.contains(it.range, pos)
            }
        }.orElse([]) as DocumentMetadata[]
    }

    static class DocumentMetadata {
        DocumentMetadata(String id, Range range, String data) {
            this.id = id
            this.range = range
            this.data = data
        }

        private Position parsePos(JsonObject obj) {
            new Position(obj.get("line").getAsInt(), obj.get("character").getAsInt())
        }

        DocumentMetadata(JsonObject json) {
            this.id = json.get("id").getAsString()
            def rangeArray = json.get("range").getAsJsonArray()
            def start = rangeArray.get(0).getAsJsonObject()
            def end = rangeArray.get(1).getAsJsonObject()
            this.range = new Range(parsePos(start), parsePos(end))
            this.data = json.get("data").getAsString()
            this.type = json.get("type").getAsString()
        }

        String type
        String id
        Range range
        String data
    }
}
