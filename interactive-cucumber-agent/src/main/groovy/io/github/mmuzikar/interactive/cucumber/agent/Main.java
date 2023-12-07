package io.github.mmuzikar.interactive.cucumber.agent;

import org.apache.commons.io.IOUtils;

import java.io.FileNotFoundException;
import java.io.PrintStream;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.lang.instrument.Instrumentation;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.ProtectionDomain;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtConstructor;
import javassist.CtField;
import javassist.Modifier;

public class Main {

    @FunctionalInterface
    private interface TransfomFunction {
        byte[] apply(CtClass cc) throws Exception;
    }

    private static final Map<String, TransfomFunction> transformers = new HashMap<>(Map.of(
        "io/cucumber/junit/Cucumber", cc -> {
            System.out.println("Modifying childrenInvoker :)");

            cc.getDeclaredMethod("childrenInvoker").insertBefore("{" +
                "System.out.println(\"Intercepted!\");" +
                "io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor.childrenInvoker($1, $0);" +
                "}");

            return cc.toBytecode();
        },
        "io/cucumber/core/runtime/CucumberExecutionContext", cc -> {
            cc.getDeclaredMethod("startTestRun").insertBefore("{" +
                "io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor.childrenInvoker(null, $0);" +
                "}");

            return cc.toBytecode();
        },
        "io/cucumber/core/runtime/Runtime", cc -> {
            final CtField instanceField = new CtField(cc, "instance", cc);
            instanceField.setModifiers(Modifier.STATIC | Modifier.PUBLIC);
            cc.addField(instanceField);

            for (CtConstructor constructor : cc.getDeclaredConstructors()) {
                constructor.insertAfter("{System.out.println(\"Runtime constructed\"); io.cucumber.core.runtime.Runtime.instance = $0;}");
            }

            cc.getDeclaredMethod("run").insertAfter("{System.out.println(\"run called\");}");

            return cc.toBytecode();
        },
        "io/cucumber/core/gherkin/messages/GherkinMessagesFeature", cc -> {

            for (CtConstructor constructor : cc.getDeclaredConstructors()) {
                constructor.insertAfter("io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor.constructedFeatures.add($0);");
            }

            return cc.toBytecode();
        }
    ));

    public static void premain(String arg, Instrumentation instrumentation) {
        instrumentation.addTransformer(new ClassFileTransformer() {
            @Override
            public byte[] transform(ClassLoader classLoader, String className, Class<?> aClass, ProtectionDomain protectionDomain, byte[] bytes)
                throws IllegalClassFormatException {
                if (className == null) {
                    return null;
                }

                if (!transformers.containsKey(className)) {
                    return bytes;
                }

                ClassPool cp = ClassPool.getDefault();
                String targetClassName = className.replaceAll("/", ".");
                CtClass cc = null;
                try {
                    cc = cp.get(targetClassName);

                    if (cc == null) {
                        return null;
                    }
                    if (cc.isFrozen()) {
                        cc.detach();
                        return null;
                    }

                    final byte[] bytecode = transformers.get(className).apply(cc);
                    IOUtils.writeChunked(bytecode, Files.newOutputStream(Paths.get("target/" + cc.getSimpleName() + ".class")));

                    cc.detach();
                    transformers.remove(className);
                    //                    instrumentation.removeTransformer(this);
                    return bytecode;
                } catch (Exception e) {
                    e.printStackTrace();
                    System.out.println("OOps");
                    try (PrintStream ps = new PrintStream("target/agent-crash.log")) {
                        e.printStackTrace(ps);
                    } catch (FileNotFoundException ex) {
                        throw new RuntimeException(ex);
                    }
                    return null;
                }
                //                cc.getDeclaredMethod("childrenInvoker").insertAfter("mmuzikar.CucumberInterceptor.childrenInvoker(\$1,\$0);")

            }
        });
        InteractiveAgent.premain(arg, instrumentation);
    }
}
