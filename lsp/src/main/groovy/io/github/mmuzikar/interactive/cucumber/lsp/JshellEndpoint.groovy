package io.github.mmuzikar.interactive.cucumber.lsp

import org.codehaus.groovy.runtime.MethodClosure

import com.github.javaparser.JavaParser
import com.github.javaparser.ast.body.MethodDeclaration
import com.github.javaparser.ast.expr.FieldAccessExpr
import com.github.javaparser.ast.expr.NameExpr
import com.github.javaparser.ast.stmt.ReturnStmt
import com.github.javaparser.ast.visitor.VoidVisitorAdapter
import com.github.javaparser.ast.visitor.VoidVisitorWithDefaults
import com.google.gson.Gson
import com.google.gson.JsonObject

import javax.script.ScriptContext
import javax.script.ScriptEngine
import javax.script.ScriptEngineManager

import java.util.concurrent.Callable
import java.util.concurrent.TimeUnit

import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import jakarta.websocket.RemoteEndpoint

class JshellEndpoint {

    private static final gson = new Gson()

    ScriptEngine engine

    RemoteEndpoint.Basic endpoint

    JshellEndpoint(RemoteEndpoint.Basic basic) {
        ScriptEngineManager manager = new ScriptEngineManager();
        engine = manager.getEngineByName("jshell");

        registerFunction("inspect", this::inspect)
        endpoint = basic
    }

    void registerVariable(String name, Object value) {
        engine.put(name, value)
    }

    void registerFunction(String name, Closure closure) {
        engine.put("${name}__closure", closure)
    }

    def inspect(Object o) {
        o = gson.toJson(o)
        endpoint.sendText("{\"jsonrpc\":\"2.0\", \"method\": \"jshell/inspect\", \"params\": [${o}]}")
    }

    String funcPrelude() {
        def scope = engine.getBindings(ScriptContext.ENGINE_SCOPE)
        String prelude = ""
        scope.forEach { String name, def val ->
            if (val instanceof MethodClosure) {
                val = val as MethodClosure
                def argId = 0
                def args = val.parameterTypes.collect { "${it.name} arg${argId++}"}.join(",")
                prelude += "Object ${name.replace("__closure", "")}($args) { return ${name}.call(${(0..<argId).collect {"arg${it}"}.join(",")}); }\n"
            } else if (Runnable.class.isAssignableFrom(val?.getClass())) {
                prelude += "Object ${name.replace("__closure", "")}(Object... args) { return ${name}.call(args); }\n"
            }
        }
        return prelude
    }

    def eval(String script) {
        def jp = new JavaParser()
        def result = jp.parse(script)
        if (result.result.present) {
            def it = result.result.get()
            def clazzNode = it.getType(0)
            def imports = it.imports.findAll {
                !it.name.asString().startsWith('io.github.mmuzikar.interactive.cucumber.api')
            }
            def runMethod = clazzNode.getMethodsByName('run').first()
            def methods = new ArrayList<>(clazzNode.getMethods())
            methods.remove(runMethod)


            runMethod.accept(new VoidVisitorAdapter<Void>() {
                @Override
                void visit(FieldAccessExpr n, Void arg) {
                    if (n.scope.isNameExpr() && ['Variables', 'BaseRunnerScript'].contains(n.scope.asNameExpr().nameAsString)) {
                        n.getParentNode().ifPresent { it.replace(n, new NameExpr(n.name))}
                    }
                }
            }, null)

            try {
                def body = runMethod.body.get()
                script = imports.join('\n') + funcPrelude() + methods.collect {it.toString()}.join('\n') + body
                def resp = CucumberInterceptor.cucumber.executor.submit(new Callable<Object>() {
                    @Override
                    Object call() throws Exception {
                        //try to cast early to avoid accessing data on another threads
                        return castToReadable(engine.eval(script))
                    }
                }).get(5, TimeUnit.SECONDS)

                return [state: 'success', data: resp]
            } catch (javax.script.ScriptException e) {
                return [state: 'failure', data: e.toString()]
            }
        } else {
            return [state: 'failure', data: result.problems]
        }
    }

    private static def castToReadable(def obj) {
        if (obj == null) {
            return null
        }
        try {
            return gson.toJson(obj)
        } catch (e) {
            return obj.toString()
        }
    }

    def respond(int id, def response) {
        try {
            response = castToReadable(response)
        } catch (Exception e) {
            response = gson.toJson([state: 'failure', data: e.toString()])
        }
        endpoint.sendText("{\"jsonrpc\":\"2.0\", \"id\": ${id}, \"result\": ${response}}")
    }

    void execute(JsonObject request) {
        def method = request.get("method").asString.substring("jshell/".length())
        def id = request.get("id").asInt
        def params = request.get("params").asJsonObject
        switch (method) {
            case 'eval':
                respond(id, eval(params.get("script").asString))
                break
        }
    }
}
