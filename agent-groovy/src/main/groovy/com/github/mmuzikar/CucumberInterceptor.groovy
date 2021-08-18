package com.github.mmuzikar

import com.github.mmuzikar.data.Cucumber
import com.github.mmuzikar.handlers.Handlers
import com.github.mmuzikar.utils.Configuration
import com.sun.net.httpserver.HttpServer


class CucumberInterceptor implements GroovyObject {

    static Cucumber cucumber
    static def suggestionProviders = []

    static def fillValues(cucumber) {
        try {
            this.cucumber = new Cucumber(cucumber)
            println "Registered ${this.cucumber.glue.stepDefinitions.size()} steps"
            suggestionProviders.each { typeName, annotation ->
                this.cucumber.typeRegistry.registerSuggestionProviderForType(typeName, annotation)
            }
        } catch (e) {
            println(e)
        }
    }

    static Object childrenInvoker(notifier, cucumber) {
        println("Running children invoker");
        fillValues(cucumber);
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(Configuration.getExposedPort()), 5);
            Handlers.values().each {
                server.createContext(it.handler.getPath(), it.handler::safeHandle)
                println "Registered path ${it.handler.getPath()} @ ${it.handler.getClass().getName()}"
            }
            server.start();
            println "Server is open http://localhost:${Configuration.getExposedPort()}"

        } catch (Exception e) {
            e.printStackTrace();
        }
        Thread.currentThread().suspend();
        return new Object();
    }

}
