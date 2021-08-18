package com.github.mmuzikar.handlers

import com.github.interactive.cucumber.ISuggestionProvider
import com.github.mmuzikar.CucumberInterceptor
import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange
import groovy.json.JsonSlurper

class SuggestionHandler implements Handler {

    private Map<String, ISuggestionProvider> providers = [:];

    void handle(HttpExchange exchange) throws IOException {
        def body = getRequestBody(exchange);
        def request = new JsonSlurper().parseText(body);
        String type = request.providerType;

        if (CucumberInterceptor.cucumber.typeRegistry.hasSuggestionProviderForType(type)) {
            providers.put(type, CucumberInterceptor.cucumber.typeRegistry.getSuggestionsProviderForType(type).newInstance())
        } else if (!providers.containsKey(type)) {
            providers.put(type, Class.forName(type).asSubclass(ISuggestionProvider).newInstance())
        }

        def provider = providers.get(type);
        RunStepHandler.executor.execute {
            def values = provider.provide(request.stepVal)
            sendResponse(exchange, new Gson().toJson(values))
        }
    }
}
