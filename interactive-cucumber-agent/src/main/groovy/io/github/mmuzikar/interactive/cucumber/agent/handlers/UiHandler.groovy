package io.github.mmuzikar.interactive.cucumber.agent.handlers

import com.sun.net.httpserver.HttpExchange
import org.apache.commons.io.IOUtils

class UiHandler implements Handler {
    @Override
    String getPath() {
        return '/'
    }

    @Override
    void handle(HttpExchange exchange) throws IOException {
        def path = exchange.requestURI.getPath()

        if (path == "/") {
            path = "/index.html"
        }

        def content = IOUtils.toString(UiHandler.getResource("/ui$path"), "UTF-8")

        exchange.responseHeaders.add("X-IS-HOSTED", "true")
        exchange.sendResponseHeaders(200, content.bytes.length);
        exchange.getResponseBody().write(content.bytes);
        exchange.getResponseBody().close();
    }
}
