package mmuzikar.handlers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import lombok.AllArgsConstructor;
import mmuzikar.api.ISuggestionProvider;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static mmuzikar.handlers.Handler.getRequestBody;

//Provides suggestions for suggestion provider indicated by classname in the request body
public class SuggestionHandler implements Handler {

    //Cache or instanciated suggestion providers
    private Map<String, ISuggestionProvider> providers;

    public SuggestionHandler() {
        this.providers = new HashMap<>();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String body = getRequestBody(exchange);
        SuggestionRequest req = new Gson().fromJson(body, SuggestionRequest.class);
        if (providers.get(req.providerType) == null) {
            try {
                Class<? extends ISuggestionProvider> clazz = Class.forName(req.providerType).asSubclass(ISuggestionProvider.class);
                providers.put(req.providerType, clazz.asSubclass(ISuggestionProvider.class).newInstance());
            } catch (Throwable t) {
                Handler.sendResponse(exchange, "No suggestion provider of type " + req.providerType + "found", 404);
            }
        }
        ISuggestionProvider provider = providers.get(req.providerType);
        List<Object> suggestions = provider.provide(req.stepVal, req.argId);
        Handler.sendResponse(exchange, new Gson().toJson(suggestions));
    }

    @AllArgsConstructor
    private static final class SuggestionRequest {
        public final String providerType;
        public final String stepVal;
        public final int argId;
    }
}
