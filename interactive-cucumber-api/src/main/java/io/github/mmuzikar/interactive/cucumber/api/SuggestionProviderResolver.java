package io.github.mmuzikar.interactive.cucumber.api;

import java.util.List;

import io.github.mmuzikar.interactive.cucumber.api.datatable.DatatableSuggestionProvider;

public interface SuggestionProviderResolver {

    List<SuggestionItem> resolveSuggestions(String text, String suggestionProvider);
    Class<? extends SuggestionProvider> resolveSuggestionProviderForType(Class<?> clazz);

    <T extends SuggestionProvider> T resolveSuggestionProvider(Class<T> clazz);

    List<SuggestionItem> resolveSuggestionsForDataTable(DatatableSuggestionProvider provider, String step, int rowId, int columnId, List<List<String>> table);

    boolean hasSuggestionProviderForType(Class<?> clazz);

}
