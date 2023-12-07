package io.github.mmuzikar.interactive.cucumber.agent.data.impl

import java.util.concurrent.Executor

import io.cucumber.core.backend.HookDefinition
import io.cucumber.core.backend.TestCaseState
import io.cucumber.plugin.event.TestStep
import io.github.mmuzikar.interactive.cucumber.agent.data.Glue
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.agent.data.TypeRegistry
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver

class GlueImpl implements Glue {

    List<StepDefinition> stepDefinitions;
    def origObject;
    def runner

    GlueImpl(origObject, runner, TypeRegistry typeRegistry, SuggestionProviderResolver resolver) {
        origObject.prepareGlue(typeRegistry.origObject)
        typeRegistry.registerCustomProviders()
        stepDefinitions = origObject.stepDefinitions.collect {
            new StepDefinitionImpl(it, resolver)
        }
        this.origObject = origObject;
        this.runner = runner
    }

    List<TestStep> getBeforeHooks() {
        runner.createTestStepsForBeforeHooks([])
    }

    List<HookDefinition> getBeforeStepHooks() {
        origObject.beforeStepHooks.collect {
            it.delegate
        }
    }

    List<TestStep> getAfterHooks() {
        runner.createTestStepsForAfterHooks([])
    }

    List<HookDefinition> getAfterStepHooks() {
        origObject.afterStepHooks.collect {
            it.delegate
        }
    }

    @Override
    Object stepDefinitionMatch(URI uri, Object stepObj) {
        return origObject.stepDefinitionMatch(uri, stepObj)
    }

    @Override
    void prepareGlue(Object typeRegistry) {
        origObject.prepareGlue(typeRegistry)
    }

    @Override
    void runBeforeHooks(Executor executor, TestCaseState testCase) {
        executor.execute {
            beforeHooks.each {
                it.definitionMatch.runStep(testCase)
            }
        }
    }
}

