package io.github.mmuzikar.interactive.cucumber.agent.utils

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider


class NoopSuggestionProvider implements SuggestionProvider{
    List<SuggestionItem> provide(String step) {
        return Collections.emptyList()
    }
}
