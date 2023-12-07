package io.github.mmuzikar.interactive.cucumber.agent.data

import io.cucumber.core.runtime.Runtime
import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import io.github.mmuzikar.interactive.cucumber.agent.handlers.RunStepHandler

import io.cucumber.core.gherkin.Feature
import javassist.ClassPool

class Cucumber implements GroovyObject {

    Glue glue;
    def runner;
    def origObject;

    def testCase = new InteractiveTestCaseState()

    TypeRegistry typeRegistry
    List<Feature> features


    Cucumber(origObject) {
        this.origObject = origObject;
        this.runner = _getRunner(origObject)
        this.features = _getFeatures(origObject)
        this.typeRegistry = new TypeRegistry(runner.createTypeRegistryForPickle(features.first().pickles.first()))

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

    Optional<Throwable> runStep(String step) {
        def stepObj = createStep(step)
        def match
        try {
            match = glue.origObject.stepDefinitionMatch(URI.create("inmemory"), stepObj)
        } catch (Throwable e) {
            return Optional.of(e)
        }
        if (match == null) {
            return Optional.of(new IllegalStateException("No match found for step $step".toString()))
        }
        try {
            match.runStep(testCase)
        } catch (Throwable t) {
            return Optional.of(t)
        }
        return Optional.empty()
    }

    private def _getRunner(Object o) {
        if (o.hasProperty("context")) {
            o.context.runnerSupplier.get()
        } else if (o.hasProperty("runnerSupplier")) {
            o.runnerSupplier.get()
        } else {
            throw new RuntimeException("Can't find runner supplier field in cucumber")
        }
    }

    private def _getFeatures(Object o) {
        if (o.hasProperty("features")) {
            return o.features
        } else if (o.hasProperty("children")){
            return o.children*.feature
        } else {
            return CucumberInterceptor.constructedFeatures
        }
//        else {
//            Runtime.builder().build()
//            return Runtime.instance.featureSupplier.get()
//        }
    }
}
