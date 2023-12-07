package io.github.mmuzikar.interactive.cucumber.agent

import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.agent.data.impl.CucumberImpl
import io.github.mmuzikar.interactive.cucumber.lsp.InteractiveCucumberLanguageServer
import io.github.mmuzikar.interactive.cucumber.lsp.handlers.LogHandler

class CucumberInterceptor implements GroovyObject {

    public static Cucumber cucumber
    static boolean ready = false

    public static List<Object> constructedFeatures = []

    static def fillValues(cucumber) {
        try {
            this.cucumber = new CucumberImpl(cucumber)
            println "Registered ${this.cucumber.glue.stepDefinitions.size()} steps"
        } catch (e) {
            throw new RuntimeException("Couldn't read Cucumber structure, the Cucumber version might be incompatible with this agent", e)
        }
        ready = true
    }

    static Object childrenInvoker(notifier, cucumber) {
        println("Running children invoker");
        fillValues(cucumber);

        println("Starting LSP")
        InteractiveCucumberLanguageServer lsp = new InteractiveCucumberLanguageServer(CucumberInterceptor.cucumber)
        lsp.startServer()

        Thread.currentThread().suspend();
        return new Object();
    }
}
