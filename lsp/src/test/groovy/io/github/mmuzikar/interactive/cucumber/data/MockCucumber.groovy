package io.github.mmuzikar.interactive.cucumber.data

import java.util.concurrent.ExecutorService

import io.cucumber.core.gherkin.Feature
import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.agent.data.Glue
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.agent.data.TypeRegistry
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver

class MockCucumber implements Cucumber {

    Glue glue
    List<Feature> features
    TypeRegistry typeRegistry

    MockCucumber(List<StepDefinition> stepDefinitions, List<Feature> features, TypeRegistry typeRegistry) {
        glue = new MockGlue(stepDefinitions)
        this.features = features
        this.typeRegistry = typeRegistry
    }

    @Override
    Throwable runStep(String step) {
        def match = glue.stepDefinitionMatch(URI.create("inmemory:asdf"), step) as StepDefinition

        //TODO: RUN
        return null
    }

    @Override
    SuggestionProviderResolver getSuggestionProviderResolver() {
        return null
    }

    @Override
    ExecutorService getExecutor() {
        return null
    }
}
