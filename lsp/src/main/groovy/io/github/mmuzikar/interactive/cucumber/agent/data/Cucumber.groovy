package io.github.mmuzikar.interactive.cucumber.agent.data

import java.util.concurrent.ExecutorService

import io.cucumber.core.gherkin.Feature
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver

interface Cucumber {
    Glue getGlue()

    List<Feature> getFeatures()

    TypeRegistry getTypeRegistry()

    Throwable runStep(String step)

    SuggestionProviderResolver getSuggestionProviderResolver()

    ExecutorService getExecutor()
}
