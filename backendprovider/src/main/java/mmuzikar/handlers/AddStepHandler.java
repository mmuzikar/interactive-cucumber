package mmuzikar.handlers;

import com.sun.net.httpserver.HttpExchange;
import gherkin.deps.com.google.gson.Gson;
import lombok.Data;
import me.coley.memcompiler.Compiler;
import me.coley.memcompiler.JavaXCompiler;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static mmuzikar.handlers.Handler.getRequestBody;
import static mmuzikar.handlers.Handler.sendResponse;

public class AddStepHandler implements Handler {

    private InMemoryClassLoader classLoader;

    public AddStepHandler() {
        classLoader = new InMemoryClassLoader();
        if (System.getProperty("os.name").toLowerCase().contains("windows")) { //Added this check
            String h = System.getProperty("java.home");
            if (!h.endsWith("jre")) {
                h = h.replace("jre", "jdk") + File.separator + "jre";
                System.setProperty("java.home", h);
            }
        }
    }

    private static CompilationUnit getCompilationUnit(String json) {
        return new Gson().fromJson(json, CompilationUnit.class);
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String body = getRequestBody(exchange);
        CompilationUnit unit = getCompilationUnit(body);
        Compiler compiler = new JavaXCompiler();
        compiler.addUnit(unit.getClassName(), unit.getClassCode());
        if (compiler.compile()) {
            sendResponse(exchange, "TODO");
            classLoader.addClass(unit.getClassName(), compiler.getUnitCode(unit.getClassName()));
        } else {
            sendResponse(exchange, "Code couldn't compile", 400);
        }
    }

    @Data
    private static final class CompilationUnit {
        private final String className;
        private final String classCode;
    }

    private static final class InMemoryClassLoader extends ClassLoader {

        private final Map<String, Class<?>> dynamicClasses;

        public InMemoryClassLoader() {
            dynamicClasses = new HashMap<>();
        }

        public void addClass(String name, byte[] bytecode) {
            dynamicClasses.put(name, defineClass(name, bytecode, 0, bytecode.length));
        }

        @Override
        public Class<?> loadClass(String name) throws ClassNotFoundException {
            if (dynamicClasses.containsKey(name)) {
                return dynamicClasses.get(name);
            }
            throw new ClassNotFoundException();
        }
    }
}
