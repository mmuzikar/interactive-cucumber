package com.github.mmuzikar.interactive.cucumber.agent.handlers

import com.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
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
                sendResponse(exchange, result.get().getMessage(), 500)
                result.get().printStackTrace()
            } else {
                sendResponse(exchange, "")
            }
        }
    }
}
