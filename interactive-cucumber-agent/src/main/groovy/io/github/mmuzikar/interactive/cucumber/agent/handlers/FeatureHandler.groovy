package io.github.mmuzikar.interactive.cucumber.agent.handlers

import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange

class FeatureHandler implements Handler {

    void handle(HttpExchange exchange) throws IOException {
        sendResponse(exchange, new Gson().toJson(CucumberInterceptor.cucumber.features.collect {
            [
                    uri   : it.uri.toString().replace('classpath:', ''),
                    source: it.source
            ]
        }))
    }
}
