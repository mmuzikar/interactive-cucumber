package mmuzikar.api;

import java.util.List;

public abstract class SimpleSuggestionProvider implements ISuggestionProvider{
    @Override
    public List<Object> provide(String step, int arg) {
        return provide(step);
    }
}
