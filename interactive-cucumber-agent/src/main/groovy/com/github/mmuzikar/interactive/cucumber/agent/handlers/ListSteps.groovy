package com.github.mmuzikar.interactive.cucumber.agent.handlers

import com.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange

class ListSteps implements Handler {

	void handle(HttpExchange exchange) throws IOException {
		def resp = new Gson().toJson(CucumberInterceptor.cucumber.glue.stepDefinitions, List)
		sendResponse(exchange, resp)
	}
}
