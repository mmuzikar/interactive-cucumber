package xmuzik06.handlers;

import com.sun.net.httpserver.HttpExchange;
import cucumber.runtime.Argument;
import cucumber.runtime.StepDefinition;
import gherkin.pickles.PickleStep;
import lombok.extern.java.Log;
import xmuzik06.data.StepDefPOJO;
import xmuzik06.interceptors.CucumberInterceptor;
import xmuzik06.processors.StepDefProcessor;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static xmuzik06.handlers.Handler.*;

@Log
public class RunStepHandler implements Handler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String step = getRequestBody(exchange);
        List<StepDefPOJO> matchedSteps = StepDefProcessor.getStepDefs().parallelStream()
                .filter(def -> step.matches(def.getPattern()))
                .collect(Collectors.toList());
        if (matchedSteps.size() > 1){
            sendResponse(exchange, "Ambiguious definiton", 409);
            return;
        }
        if (matchedSteps.size() == 0){
            sendResponse(exchange, "No definition", 404);
            return;
        }
        List<Argument> args = matchedSteps.get(0).getOrigStepDef().matchedArguments(new PickleStep(step, Collections.emptyList(), Collections.emptyList()));
        if (args == null){
            sendResponse(exchange, "Wrong params", 500);
            return;
        }
        log.info("Args: " + args);
        try {
            matchedSteps.get(0).getOrigStepDef().execute("en", args.stream().map(Argument::getVal).toArray());
        } catch (Throwable e) {
            e.printStackTrace();
            sendResponse(exchange, e.getMessage(), 500);
            return;
        }
        sendResponse(exchange, "OK");
    }

    @Override
    public String getPath() {
        return "/runstep";
    }
}
