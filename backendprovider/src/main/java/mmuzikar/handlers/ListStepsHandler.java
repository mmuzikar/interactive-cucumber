package mmuzikar.handlers;

import com.sun.net.httpserver.HttpExchange;
import gherkin.deps.com.google.gson.Gson;
import lombok.extern.java.Log;
import mmuzikar.processors.StepDefProcessor;

import java.io.IOException;

import static mmuzikar.handlers.Handler.sendResponse;

@Log
public class ListStepsHandler implements Handler {


    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            String resp = new Gson().toJson(StepDefProcessor.getStepDefs());
            sendResponse(exchange, resp);
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, e.getMessage(), 500);
        }
    }
}
