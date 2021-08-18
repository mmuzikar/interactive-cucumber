package com.github.mmuzikar.utils

import com.github.interactive.cucumber.ISuggestionProvider


class NoopSuggestionProvider implements ISuggestionProvider{
    List<Object> provide(String step) {
        return Collections.emptyList()
    }
}
