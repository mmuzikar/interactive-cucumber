package io.github.mmuzikar.interactive.cucumber.lsp.storage

import org.eclipse.lsp4j.jsonrpc.services.JsonSegment

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.attribute.BasicFileAttributes
import java.util.concurrent.CompletableFuture
import java.util.zip.ZipFile

class RemoteFSEndpointImpl implements RemoteFSEndpoint {

    @Override
    void hello() {
    }

    <T> CompletableFuture<T> withTry(Closure<T> c) {
        try {
            return CompletableFuture.completedFuture(c())
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e)
        }
    }

    CompletableFuture<Stat> stat(String uri) {
        return withTry {
            def attributes = Files.readAttributes(getFile(uri).toPath(), BasicFileAttributes)
            return new Stat(attributes)
        }
    }

    CompletableFuture<Object> readDirectory(String uri) {
        return withTry {
            def file = getFile(uri)
            if (file.directory) {
                def children = file.listFiles()

                def resp = children.collect {
                    [it.name, it.directory ? Stat.DIRECTORY_TYPE : Stat.FILE_TYPE]
                }
                return resp
            }
            throw new RuntimeException("${uri} is not a folder")
        }
    }

    CompletableFuture<byte[]> readFile(String path) {
        return withTry {
            path = path.replace("%21", "?")
            def file = getFile(path)
            URI uri = URI.create(path)
            if (uri.getQuery() && file.path.endsWith(".jar")) {
                def className = uri.getQuery()
                if (className.startsWith("/")) {
                    className = className.substring(1)
                }
                def zipFile = new ZipFile(file)
                def entry = zipFile.getEntry(className)
                return zipFile.getInputStream(entry).readAllBytes()
            }
            return file.readBytes()
        }
    }

    private static File getFile(String uri) {
        uri = uri.replace("%21", "?")
        URI _uri = URI.create(uri)
        uri = _uri.path

        if (uri.startsWith(System.getProperty("localRepository"))) {
            return Path.of(uri).toAbsolutePath().toFile();
        }

        if (uri.startsWith("/")) {
            uri = uri.substring(1)
        }

        if (uri.isEmpty()) {
            return Path.of("").toAbsolutePath().toFile()
        }

        return new File(uri)
    }



}
