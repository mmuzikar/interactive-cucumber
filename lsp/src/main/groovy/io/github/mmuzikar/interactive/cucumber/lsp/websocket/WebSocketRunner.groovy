package io.github.mmuzikar.interactive.cucumber.lsp.websocket

import org.glassfish.tyrus.server.Server

import java.nio.file.FileSystems
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption

import io.github.mmuzikar.interactive.cucumber.lsp.InteractiveCucumberLSPConfig

class WebSocketRunner {

    private boolean isStarted = false;
    private boolean isStopped = false;

    void run(String hostname = 'localhost', int port = 5115, String contextPath = '/') {
        Server server = new Server(hostname, port, contextPath, [(Server.STATIC_CONTENT_ROOT): getUIRoot().toAbsolutePath().toString()], InteractiveCucumberLSPConfig.class)
        try {
            server.start()
            isStarted = true
            println("Interactive Cucumber application is running on http://${hostname}:${port}/")
            Thread.currentThread().join()
        } catch (Throwable t) {
            t.printStackTrace()
        } finally {
            server.stop()
        }
    }

    private Path getUIRoot() {
        def uiResources = getClass().getResource('/assets/')

        def assets = Files.createTempDirectory("ui-resources")
        def fs = FileSystems.newFileSystem(uiResources.toURI(), [:])
        def from = fs.getPath("assets")
        Files.walk(from).forEach {
            def dest = assets.resolve(from.relativize(it).toString())

            if (Files.isDirectory(it)) {
                if (Files.notExists(dest)) {
                    Files.createDirectories(dest)
                }
            } else {
                Files.copy(it, dest, StandardCopyOption.REPLACE_EXISTING)
            }
        }

        return assets
    }
}
