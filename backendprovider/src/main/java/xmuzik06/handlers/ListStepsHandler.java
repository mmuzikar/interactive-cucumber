package xmuzik06.handlers;

import com.sun.net.httpserver.HttpExchange;
import cucumber.runtime.StepDefinition;
import gherkin.deps.com.google.gson.Gson;
import lombok.extern.java.Log;
import xmuzik06.annotations.Suggestion;
import xmuzik06.data.CucumberArg;
import xmuzik06.data.StepDefPOJO;
import xmuzik06.interceptors.CucumberInterceptor;
import xmuzik06.processors.StepDefProcessor;

import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.List;
import java.util.stream.Collectors;

import static xmuzik06.handlers.Handler.sendResponse;

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
