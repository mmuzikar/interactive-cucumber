package io.github.mmuzikar.interactive.cucumber.agent.handlers

import com.sun.net.httpserver.HttpExchange

import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor

interface Handler extends HandlerTrait {
    //gets called when a request to the path is made
    void handle(HttpExchange exchange) throws IOException;

    //returns path that should be registered for this handler
    default String getPath() {
        return "/" + getClass().getSimpleName().toLowerCase().replace("handler", "");
    }

    default void safeHandle(HttpExchange exchange) throws IOException {
        if (!CucumberInterceptor.ready) {
            sendResponse(exchange, "Application is starting...")
            return
        }
        try {
            handle(exchange)
        } catch(Throwable t) {
            t.printStackTrace()
            sendResponse(exchange, "Internal server error while handling your request: ${t.toString()}", 500)
        }
    }


}