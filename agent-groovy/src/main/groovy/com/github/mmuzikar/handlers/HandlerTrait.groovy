package com.github.mmuzikar.handlers

import com.sun.net.httpserver.HttpExchange
import org.apache.commons.io.IOUtils

import java.nio.charset.Charset

trait HandlerTrait {

    //    //==== utility functions ====
    String getRequestBody(HttpExchange exchange) throws IOException {
        return IOUtils.toString(exchange.getRequestBody(), Charset.defaultCharset());
    }

    void sendResponse(HttpExchange exchange, String response) throws IOException {
        sendResponse(exchange, response, 200);
    }

    void sendResponse(HttpExchange exchange, String response, int status) throws IOException {
        exchange.getResponseHeaders().add("Content-Type", "text/json");
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(status, response.getBytes().length);
        exchange.getResponseBody().write(response.getBytes());
        exchange.getResponseBody().close();
    }

}