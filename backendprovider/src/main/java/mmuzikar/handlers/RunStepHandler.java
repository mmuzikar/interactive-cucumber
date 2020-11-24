package mmuzikar.handlers;

import com.sun.net.httpserver.HttpExchange;
import lombok.extern.java.Log;
import mmuzikar.datamapping.Datatable;
import mmuzikar.datamapping.StepDefinition;
import mmuzikar.processors.StepDefProcessor;

import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.stream.Collectors;

import static mmuzikar.handlers.Handler.getRequestBody;
import static mmuzikar.handlers.Handler.sendResponse;

/**
 * From the step provided in request body a suitable step definition is found
 * and executed
 */
@Log
public class RunStepHandler implements Handler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String step = getRequestBody(exchange);
        String data = null;
        if (step.contains("\n")){
            String[] split = step.split("\n");
            data = step.substring(step.indexOf('\n')+1);
            step = split[0];
        }
        log.info("Searching for stepdef with body" + step);
        String finalStep = step;
        List<StepDefinition> matchedSteps = StepDefProcessor.getStepDefs().stream()
                .filter(def -> def.pattern.matcher(finalStep).matches())
                .collect(Collectors.toList());
        if (matchedSteps.size() > 1) {
            sendResponse(exchange, "Ambiguious definiton", 409);
            return;
        }
        if (matchedSteps.size() == 0) {
            sendResponse(exchange, "No definition", 404);
            return;
        }
        StepDefinition stepDef = matchedSteps.get(0);
        Matcher matcher = stepDef.pattern.matcher(step);
        Object[] args = new Object[matcher.groupCount() + (data == null ? 0 : 1)];
        if (matcher.matches()) {
            for (int i = 1; i < matcher.groupCount() + 1; i++) {
                String val = matcher.group(i);
                args[i - 1] = val;
            }
            if (data != null){
                if (Datatable.isTable(data)){
                    args[args.length-1] = Datatable.parseTable(data);
                } else {
                    args[args.length-1] = data;
                }
            }
            //TODO: convert string
            try {
                stepDef.execute((Object[]) args);
            } catch (Throwable e) {
                e.printStackTrace();
                sendResponse(exchange, e.getMessage(), 500);
                return;
            }
        }
        //List<Argument> args = matchedSteps.get(0).getOrigStepDef().matchedArguments(new PickleStep(step, Collections.emptyList(), Collections.emptyList()));
//        if (args == null){
//            sendResponse(exchange, "Wrong params", 500);
//            return;
//        }
//        try {
//            matchedSteps.get(0).getOrigStepDef().execute("en", args.stream().map(Argument::getVal).toArray());
//        } catch (Throwable e) {
//            e.printStackTrace();
//            sendResponse(exchange, e.getMessage(), 500);
//            return;
//        }
        sendResponse(exchange, "OK");
    }

    @Override
    public String getPath() {
        return "/runstep";
    }
}
