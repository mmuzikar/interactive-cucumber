package io.github.mmuzikar.interactive.cucumber.data

import java.util.function.Consumer

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver
import io.github.mmuzikar.interactive.cucumber.api.datatable.DatatableSuggestionProvider

class MockSuggestionProviderResolver implements SuggestionProviderResolver {

    @Override
    List<SuggestionItem> resolveSuggestions(String text, String suggestionProvider) {
        return [SuggestionItem.withText('bajajajo')]
    }

    @Override
    Class<? extends SuggestionProvider> resolveSuggestionProviderForType(Class<?> clazz) {
        return null
    }

    @Override
    boolean hasSuggestionProviderForType(Class<?> clazz) {
        return false
    }

    @Override
    def <T extends SuggestionProvider> T resolveSuggestionProvider(Class<T> clazz) {
        return null
    }

    @Override
    List<SuggestionItem> resolveSuggestionsForDataTable(DatatableSuggestionProvider provider, String step, int rowId, int columnId, List<List<String>> table) {
        return null
    }
}
