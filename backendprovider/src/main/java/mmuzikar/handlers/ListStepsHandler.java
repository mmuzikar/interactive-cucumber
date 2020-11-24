package mmuzikar.handlers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sun.net.httpserver.HttpExchange;
import lombok.extern.java.Log;
import mmuzikar.processors.StepDefProcessor;
import mmuzikar.utils.PatternSerializer;

import java.io.IOException;
import java.util.List;
import java.util.regex.Pattern;

import static mmuzikar.handlers.Handler.sendResponse;

/**
 * Lists all registered step definitions in JSON form
 */
@Log
public class ListStepsHandler implements Handler {


    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            log.info("Sending " + StepDefProcessor.getStepDefs());
            Gson gson = new GsonBuilder().registerTypeAdapter(Pattern.class, new PatternSerializer()).create();
            String resp = gson.toJson(StepDefProcessor.getStepDefs(), List.class);
            sendResponse(exchange, resp);
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, e.getMessage(), 500);
        }
    }
}
