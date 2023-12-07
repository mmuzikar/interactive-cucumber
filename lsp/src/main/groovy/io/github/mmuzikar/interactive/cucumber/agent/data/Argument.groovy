package io.github.mmuzikar.interactive.cucumber.agent.data

import org.objenesis.ObjenesisStd

import java.lang.reflect.Parameter

import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import io.github.mmuzikar.interactive.cucumber.api.Suggestion
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver
import io.github.mmuzikar.interactive.cucumber.api.datatable.BeanListSuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.datatable.DatatableSuggestion
import io.github.mmuzikar.interactive.cucumber.api.datatable.DatatableSuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.datatable.GenericSizeDatatableSuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.datatable.MapDatatableSuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.datatable.SimpleListSuggestionProvider

class Argument {

    String type;
    String suggProvider = "";

    transient DatatableSuggestionProvider datatableSuggestionProvider

    private static final ObjenesisStd objenesis = new ObjenesisStd()

    Argument(Parameter parameter, SuggestionProviderResolver resolver){
        type = parameter.getType().getName();

        Suggestion sugg = parameter.getAnnotation(Suggestion);
        if (sugg){
            suggProvider = sugg.value().getName();
        }
        if (resolver.hasSuggestionProviderForType(parameter.getType())) {
            suggProvider = resolver.resolveSuggestionProviderForType(parameter.getType()).getName()
        }

        parameter.getAnnotations().each {
            switch (it) {
                case DatatableSuggestion:
                    datatableSuggestionProvider = objenesis.newInstance((it as DatatableSuggestion).value())
                    break;
                case BeanListSuggestionProvider:
                    datatableSuggestionProvider = new DatatableSuggestionProvider.ListOfBeansDatatableSuggestionProvider((it as BeanListSuggestionProvider).value())
                    break;
                case GenericSizeDatatableSuggestionProvider:
                    def provider = it as GenericSizeDatatableSuggestionProvider
                    datatableSuggestionProvider = new DatatableSuggestionProvider.TemplateDatatableSuggestionProvider(provider.width(), provider.height())
                    break;
                case MapDatatableSuggestionProvider:
                    def provider = it as MapDatatableSuggestionProvider
                    datatableSuggestionProvider = new DatatableSuggestionProvider.ListOfBeansDatatableSuggestionProvider(provider.names(), provider.types(), provider.suggestionProviders())
                    break;
                case SimpleListSuggestionProvider:
                    datatableSuggestionProvider = new DatatableSuggestionProvider.SimpleListDatatableSuggestionProvider((it as SimpleListSuggestionProvider).value())
                    break;
            }
        }
    }

    Argument(String type, String suggProvider = "") {
        this.type = type
        this.suggProvider = suggProvider
    }

}
