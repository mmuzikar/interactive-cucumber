package com.github.mmuzikar.data

import com.github.mmuzikar.handlers.RunStepHandler

import io.cucumber.core.gherkin.Feature

class Cucumber implements GroovyObject {

    Glue glue;
    def runner;
    def origObject;

    def testCase = new InteractiveTestCaseState()

    TypeRegistry typeRegistry
    List<Feature> features

    Cucumber(origObject) {
        this.origObject = origObject;
        this.runner = origObject.context.runnerSupplier.get()
        this.features = origObject.features
        this.typeRegistry = new TypeRegistry(runner.createTypeRegistryForPickle(null))

        this.glue = new Glue(runner.glue, runner)

        runner.buildBackendWorlds();

        glue.origObject.prepareGlue(typeRegistry.origObject);

        RunStepHandler.executor.execute {
            glue.beforeHooks.each {
                it.definitionMatch.runStep(testCase)
            }
        }
    }

    private static def createStep(String text) {
        return new InMemoryStep(text)
    }

    Optional<String> runStep(String step) {
        def stepObj = createStep(step)
        def match
        try {
            match = glue.origObject.stepDefinitionMatch(URI.create("inmemory"), stepObj)
        } catch (Throwable e) {
            return Optional.of(e.message)
        }
        if (match == null) {
            return Optional.of("No match found for step $step".toString())
        }
        try {
            match.runStep(testCase)
        } catch (Throwable t) {
            return Optional.of(t.message)
        }
        return Optional.empty()
    }

}
