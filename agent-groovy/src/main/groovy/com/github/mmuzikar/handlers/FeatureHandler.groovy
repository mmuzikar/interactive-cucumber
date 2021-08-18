package com.github.mmuzikar.handlers

import com.github.mmuzikar.CucumberInterceptor
import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange

class FeatureHandler implements Handler {

    void handle(HttpExchange exchange) throws IOException {
        sendResponse(exchange, new Gson().toJson(CucumberInterceptor.cucumber.features.collect {
            [
                    uri   : it.uri,
                    source: it.source
            ]
        }))
    }
}
