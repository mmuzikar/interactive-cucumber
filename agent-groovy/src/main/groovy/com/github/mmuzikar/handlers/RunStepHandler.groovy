package com.github.mmuzikar.handlers

import com.github.mmuzikar.CucumberInterceptor
import com.sun.net.httpserver.HttpExchange

import java.util.concurrent.Executors

class RunStepHandler implements Handler {

    static def executor = Executors.newSingleThreadExecutor()

    void handle(HttpExchange exchange) throws IOException {
        def body = getRequestBody(exchange)

        println("trying to execute $body")
        executor.execute {
            def result = CucumberInterceptor.cucumber.runStep(body)
            if (result.isPresent()){
                sendResponse(exchange, result.get(), 500)
            } else {
                sendResponse(exchange, "")
            }
        }
    }
}
