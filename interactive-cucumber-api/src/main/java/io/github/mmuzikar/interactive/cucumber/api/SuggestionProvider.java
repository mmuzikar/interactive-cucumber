package io.github.mmuzikar.interactive.cucumber.api;

import java.util.List;

public interface SuggestionProvider {

    List<SuggestionItem> provide(String step);
}
