package io.github.mmuzikar.interactive.cucumber.lsp.storage

import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonRequest
import org.eclipse.lsp4j.jsonrpc.services.JsonSegment

import java.nio.file.attribute.BasicFileAttributes
import java.util.concurrent.CompletableFuture

@JsonSegment('files')
interface RemoteFSEndpoint {

    @JsonNotification('hello')
    void hello()

    @JsonRequest('stat')
    CompletableFuture<Stat> stat(String uri)
    @JsonRequest('readDirectory')
    CompletableFuture<Object> readDirectory(String uri)
    @JsonRequest('readFile')
    CompletableFuture<byte[]> readFile(String uri)

    class Stat {

        public final static int FILE_TYPE = 1;
        public final static int DIRECTORY_TYPE = 2;

        Stat(BasicFileAttributes attributes) {
            this.mtime = attributes.lastModifiedTime().toMillis()
            this.ctime = attributes.creationTime().toMillis()
            this.size = attributes.size()
            this.type = attributes.directory ? DIRECTORY_TYPE : FILE_TYPE
        }
        long mtime, ctime, size;
        int type;
        int permissions = 0;

    }
}