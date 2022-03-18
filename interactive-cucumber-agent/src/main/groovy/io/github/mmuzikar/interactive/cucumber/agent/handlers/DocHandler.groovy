package io.github.mmuzikar.interactive.cucumber.agent.handlers

import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange

class DocHandler implements Handler {

    /**
     *
     * @param exchange
     * @throws IOException
     */
    void handle(HttpExchange exchange) throws IOException {
        def fqn = getRequestBody(exchange)
        Object doc = RuntimeJavadoc.getJavadoc(fqn)
        sendResponse(exchange, new Gson().toJson(doc))
    }
}
