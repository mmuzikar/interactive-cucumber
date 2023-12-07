package io.github.mmuzikar.interactive.cucumber.data

import java.util.concurrent.Executor

import io.cucumber.core.backend.TestCaseState
import io.github.mmuzikar.interactive.cucumber.agent.data.Glue
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition

class MockGlue implements Glue{

    final List<StepDefinition> stepDefinitions

    MockGlue(List<StepDefinition> stepDefinitions) {
        this.stepDefinitions = stepDefinitions
    }

    @Override
    List<StepDefinition> getStepDefinitions() {
        return stepDefinitions
    }

    @Override
    Object stepDefinitionMatch(URI uri, Object stepObj) {
        return stepDefinitions.find {
            it.matches(stepObj as String)
        }
    }

    @Override
    void prepareGlue(Object typeRegistry) {
        //NOOP
    }

    @Override
    void runBeforeHooks(Executor executor, TestCaseState testCase) {
        //NOOP
    }
}
