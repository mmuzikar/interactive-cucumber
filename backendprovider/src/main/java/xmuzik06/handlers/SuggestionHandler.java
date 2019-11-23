package xmuzik06.handlers;

import com.sun.net.httpserver.HttpExchange;
import cucumber.runtime.StepDefinition;
import gherkin.deps.com.google.gson.Gson;
import lombok.AllArgsConstructor;
import lombok.Setter;
import xmuzik06.data.StepDefPOJO;
import xmuzik06.interceptors.CucumberInterceptor;
import xmuzik06.processors.StepDefProcessor;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static xmuzik06.handlers.Handler.getRequestBody;

public class SuggestionHandler implements Handler {

    private Map<String, ISuggestionProvider> providers;

    public SuggestionHandler() {
        this.providers = new HashMap<>();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String body = getRequestBody(exchange);
        SuggestionRequest req = new Gson().fromJson(body, SuggestionRequest.class);
        Optional<StepDefPOJO> stepdef = StepDefProcessor.getStepDefs().stream().filter(def -> req.step.equals(def.getPattern())).findFirst();
        if (!stepdef.isPresent()){
            Handler.sendResponse(exchange, "No step definition found");
            return;
        }
        StepDefPOJO def = stepdef.get();
        String suggId = def.getArgs()[req.argId].getSuggProvider();
        if (providers.get(suggId) == null){
            try {
                providers.put(suggId, ((ISuggestionProvider) Class.forName(suggId).newInstance()));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        ISuggestionProvider provider = providers.get(suggId);
        List<Object> suggestions = provider.provide(req.step, req.args, req.argId);
        Handler.sendResponse(exchange, new Gson().toJson(suggestions));
    }

    @AllArgsConstructor
    private static final class SuggestionRequest {

        public final String step;
        public final Object[] args;
        public final int argId;
    }
}
