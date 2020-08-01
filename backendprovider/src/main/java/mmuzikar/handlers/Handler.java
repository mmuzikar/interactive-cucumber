package mmuzikar.handlers;

import com.sun.net.httpserver.HttpExchange;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.nio.charset.Charset;

//General interface for any handler 
public interface Handler {

    //gets called when a request to the path is made
    void handle(HttpExchange exchange) throws IOException;

    //returns path that should be registered for this handler
    default String getPath() {
        return "/" + getClass().getSimpleName().toLowerCase().replace("handler", "");
    }

    //==== utility functions ====
    static String getRequestBody(HttpExchange exchange) throws IOException {
        return IOUtils.toString(exchange.getRequestBody(), Charset.defaultCharset());
    }

    static void sendResponse(HttpExchange exchange, String response) throws IOException {
        sendResponse(exchange, response, 200);
    }

    static void sendResponse(HttpExchange exchange, String response, int status) throws IOException {
        exchange.getResponseHeaders().add("Content-Type", "text/json");
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(status, response.getBytes().length);
        exchange.getResponseBody().write(response.getBytes());
        exchange.getResponseBody().close();
    }

}
