package io.github.mmuzikar.interactive.cucumber.agent.data.impl

import java.util.concurrent.Callable
import java.util.concurrent.Executor
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

import io.cucumber.core.gherkin.Feature
import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import io.github.mmuzikar.interactive.cucumber.agent.CucumberSuggestionProviderResolver
import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.agent.data.Glue
import io.github.mmuzikar.interactive.cucumber.agent.data.TypeRegistry
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver

//import io.github.mmuzikar.interactive.cucumber.agent.handlers.RunStepHandler

class CucumberImpl implements Cucumber {

    Glue glue;
    def runner;
    def origObject;

    def testCase = new InteractiveTestCaseState()

    TypeRegistry typeRegistry
    List<Feature> features
    SuggestionProviderResolver suggestionProvider

    static def executor = Executors.newSingleThreadExecutor()

    CucumberImpl(origObject) {
        this.origObject = origObject;
        this.runner = _getRunner(origObject)
        this.features = _getFeatures(origObject)
        this.typeRegistry = new TypeRegistry(runner.createTypeRegistryForPickle(features.first().pickles.first()))
        this.suggestionProvider = new CucumberSuggestionProviderResolver(executor, typeRegistry)
        runner.buildBackendWorlds();

        this.glue = new GlueImpl(runner.glue, runner, typeRegistry, suggestionProviderResolver)

        glue.runBeforeHooks(executor, testCase)
    }

    private static def createStep(String text) {
        return new InMemoryStep(text)
    }

    Throwable runStep(String step) {
        Callable<Throwable> run = new Callable<Throwable>(){
            Throwable call() {
                def stepObj = createStep(step)
                def match
                try {
                    match = glue.stepDefinitionMatch(URI.create("inmemory"), stepObj)
                } catch (Throwable e) {
                    return e
                }
                if (match == null) {
                    return new IllegalStateException("No match found for step $step".toString())
                }
                try {
                    match.runStep(testCase)
                } catch (Throwable t) {
                    return t
                }
                return null
            }
        }

        def future = executor.submit(run)
        def result = future.get()
        return result
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

    ExecutorService getExecutor() {
        return executor
    }

    @Override
    SuggestionProviderResolver getSuggestionProviderResolver() {
        return suggestionProvider
    }
}

