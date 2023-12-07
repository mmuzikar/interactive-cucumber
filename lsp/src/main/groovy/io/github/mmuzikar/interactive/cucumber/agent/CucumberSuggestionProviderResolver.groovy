package io.github.mmuzikar.interactive.cucumber.agent

import org.objenesis.ObjenesisStd

import java.util.concurrent.Callable
import java.util.concurrent.ExecutorService
import java.util.concurrent.TimeUnit
import java.util.function.Consumer

import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.agent.data.TypeRegistry
import io.github.mmuzikar.interactive.cucumber.agent.utils.NoopSuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.Suggestion
import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver
import io.github.mmuzikar.interactive.cucumber.api.datatable.DatatableSuggestionProvider

class CucumberSuggestionProviderResolver implements SuggestionProviderResolver {

    Map<String, SuggestionProvider> suggestionProviders = [:]

    private static final objenesis = new ObjenesisStd()
    private final ExecutorService executor
    private final TypeRegistry typeRegistry

    class GetSuggestionsCallable implements Callable<List<SuggestionItem>> {

        private final String provider
        private final String text

        GetSuggestionsCallable(String provider, String text) {
            this.provider = provider
            this.text = text
        }

        @Override
        List<SuggestionItem> call() throws Exception {
            return getSuggestionProvider(provider).provide(text)
        }
    }

    class GetDatatableSuggestionsCallable implements Callable<List<SuggestionItem>> {
        private final DatatableSuggestionProvider provider
        private final String step
        private final int rowId
        private final int columnId
        private final List<List<String>> table
        private final SuggestionProviderResolver resolver

        GetDatatableSuggestionsCallable(DatatableSuggestionProvider provider, String step, int rowId, int columnId, List<List<String>> table, SuggestionProviderResolver resolver) {
            this.provider = provider
            this.step = step
            this.rowId = rowId
            this.columnId = columnId
            this.table = table
            this.resolver = resolver
        }

        @Override
        List<SuggestionItem> call() throws Exception {
            return provider.forCell(step, rowId, columnId, table, resolver)
        }
    }

    CucumberSuggestionProviderResolver(ExecutorService executor, TypeRegistry typeRegistry) {
        this.executor = executor
        this.typeRegistry = typeRegistry
    }

    List<SuggestionItem> resolveSuggestions(String text, StepDefinition stepDefinition, String suggestionProvider) {
        executor.submit(new GetSuggestionsCallable(suggestionProvider, text)).get()
    }

    private SuggestionProvider getSuggestionProvider(String suggestionProvider) {
        if (!suggestionProviders.containsKey(suggestionProvider)) {
            createSuggestionProvider(suggestionProvider)
        }

        return suggestionProviders[suggestionProvider]
    }

    @Override
    <T extends SuggestionProvider> T resolveSuggestionProvider(Class<T> clazz) {
        return getSuggestionProvider(clazz.name) as T
    }

    @Override
    List<SuggestionItem> resolveSuggestions(String text, String suggestionProvider) {
        def callable = new GetSuggestionsCallable(suggestionProvider, text)
        if (Thread.currentThread().name.contains("Grizzly")) {
            return executor.submit(callable).get(5, TimeUnit.SECONDS)
        } else {
            return callable.call()
        }
    }

    private void createSuggestionProvider(String suggestionProvider) {
        suggestionProviders[suggestionProvider] = objenesis.newInstance(Class.forName(suggestionProvider)) as SuggestionProvider
    }

    @Override
    Class<? extends SuggestionProvider> resolveSuggestionProviderForType(Class<?> clazz) {
        def suggestion = clazz.getAnnotation(Suggestion)
        if (suggestion) {
            return suggestion.value()
        }
        return typeRegistry.getSuggestionsProviderForType(clazz.name)
    }

    @Override
    boolean hasSuggestionProviderForType(Class<?> clazz) {
        return resolveSuggestionProviderForType(clazz) != NoopSuggestionProvider
    }

    @Override
    List<SuggestionItem> resolveSuggestionsForDataTable(DatatableSuggestionProvider provider, String step, int rowId, int columnId, List<List<String>> table) {
        def callable = new GetDatatableSuggestionsCallable(provider, step, rowId, columnId, table, this)
        if (Thread.currentThread().name.contains("Grizzly")) {
            return executor.submit(callable).get(5, TimeUnit.SECONDS)
        } else {
            return callable.call()
        }
    }
}
