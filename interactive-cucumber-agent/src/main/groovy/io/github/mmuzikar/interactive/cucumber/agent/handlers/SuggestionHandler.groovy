package io.github.mmuzikar.interactive.cucumber.agent.handlers

import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider
import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange
import groovy.json.JsonSlurper

class SuggestionHandler implements Handler {

    private Map<String, SuggestionProvider> providers = [:];

    void handle(HttpExchange exchange) throws IOException {
        def body = getRequestBody(exchange);
        def request = new JsonSlurper().parseText(body);
        String type = request.providerType;

        if (CucumberInterceptor.cucumber.typeRegistry.hasSuggestionProviderForType(type)) {
            providers.put(type, CucumberInterceptor.cucumber.typeRegistry.getSuggestionsProviderForType(type).newInstance())
        } else if (!providers.containsKey(type)) {
            providers.put(type, Class.forName(type).asSubclass(SuggestionProvider).newInstance())
        }

        def provider = providers.get(type);
        RunStepHandler.executor.execute {
            try {
                def values = provider.provide(request.stepVal)
                sendResponse(exchange, new Gson().toJson(values))
            } catch (Throwable t) {
                t.printStackTrace()

                exchange.getResponseHeaders().add("Content-Type", "text/plain");
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

                def strWriter = new StringWriter()
                def printStream = strWriter.newPrintWriter()
                printStream.println(t.toString())
                t.printStackTrace(printStream)

                def resp = strWriter.toString()
                exchange.sendResponseHeaders(500, resp.size());
                exchange.getResponseBody().write(resp.getBytes("UTF-8"))
                exchange.getResponseBody().close();
            }
        }
    }
}
