package io.github.mmuzikar.interactive.cucumber.agent.handlers

import com.sun.net.httpserver.HttpExchange

import javax.script.Bindings
import javax.script.ScriptContext
import javax.script.ScriptEngineFactory
import javax.script.ScriptEngineManager
import javax.script.SimpleBindings
import javax.script.SimpleScriptContext

import io.github.mmuzikar.interactive.cucumber.api.ExposeManager

class RunScriptHandler implements Handler {

    ScriptEngineManager manager

    ScriptContext context

    Bindings bindings

    RunScriptHandler() {
        manager = new ScriptEngineManager()
        context = new SimpleScriptContext()
        bindings = new SimpleBindings()
        context.setBindings(bindings, ScriptContext.GLOBAL_SCOPE)
    }

    @Override
    void handle(HttpExchange exchange) throws IOException {
        bindings.putAll(ExposeManager.getExposedValues())

        def scriptSource = getRequestBody(exchange)

        def groovyScriptEngine = manager.getEngineByName("groovy")

        sendResponse(exchange, groovyScriptEngine.eval(scriptSource, context).toString())
    }
}
