package io.github.mmuzikar.interactive.cucumber.agent.data

import java.util.concurrent.Executor

import io.cucumber.core.backend.TestCaseState

interface Glue {
    List<StepDefinition> getStepDefinitions()
    default StepDefinition findStepDefinition(String pattern) {
        return getStepDefinitions().find {it.pattern == pattern }
    }
    Object stepDefinitionMatch(URI uri, Object stepObj)
    void prepareGlue(Object typeRegistry)
    void runBeforeHooks(Executor executor, TestCaseState testCase)
}
