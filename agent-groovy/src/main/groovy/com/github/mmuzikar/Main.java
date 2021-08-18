package com.github.mmuzikar;

import org.apache.commons.io.IOUtils;

import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.lang.instrument.Instrumentation;
import java.security.ProtectionDomain;

import javassist.CannotCompileException;
import javassist.ClassPool;
import javassist.CtClass;
import javassist.NotFoundException;

public class Main {

    public static void premain(String arg, Instrumentation instrumentation) {
        instrumentation.addTransformer(new ClassFileTransformer() {
            @Override
            public byte[] transform(ClassLoader classLoader, String className, Class<?> aClass, ProtectionDomain protectionDomain, byte[] bytes)
                throws IllegalClassFormatException {
                if (className == null) {
                    return null;
                }

                if (!className.equals("io/cucumber/junit/Cucumber")) {
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

                    System.out.println("Modifying childrenInvoker :)");

                    cc.getDeclaredMethod("childrenInvoker").insertBefore("{" +
                        "System.out.println(\"Intercepted!\");" +
                        "com.github.mmuzikar.CucumberInterceptor.childrenInvoker($1, $0);" +
                        "}");

                    final byte[] bytecode = cc.toBytecode();
                    IOUtils.writeChunked(bytecode, new FileOutputStream("target/Cucumber.class"));

                    cc.detach();
                    instrumentation.removeTransformer(this);
                    return bytecode;
                } catch (NotFoundException | CannotCompileException | IOException e) {
                    e.printStackTrace();
                    System.out.println("OOps");
                    return null;
                }
                //                cc.getDeclaredMethod("childrenInvoker").insertAfter("mmuzikar.CucumberInterceptor.childrenInvoker(\$1,\$0);")

            }
        });
        InteractiveAgent.premain(arg, instrumentation);
    }
}
