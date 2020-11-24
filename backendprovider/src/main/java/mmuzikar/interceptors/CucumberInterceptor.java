package mmuzikar.interceptors;

import com.sun.net.httpserver.HttpServer;
import lombok.Getter;
import lombok.extern.java.Log;
import mmuzikar.AgentConfiguration;
import mmuzikar.datamapping.BaseMappingObject;
import mmuzikar.datamapping.Glue;
import mmuzikar.datamapping.Runtime;
import mmuzikar.handlers.Handlers;
import mmuzikar.processors.StepDefProcessor;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.implementation.bind.annotation.RuntimeType;
import net.bytebuddy.implementation.bind.annotation.This;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.net.InetSocketAddress;
import java.util.List;

@Log
public class CucumberInterceptor {

    @Getter
    private static Glue glue;

    @Getter
    private static Runtime runtime;

    private static String lastMessage;

    private static void fillValues(Object cucumber) {
        try {
            runtime = BaseMappingObject.from(cucumber, Runtime.class);
            log.info("Runtime glue: " + runtime.glue);
            glue = runtime.glue;
            glue.reportStepDefinitions(StepDefProcessor::process);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * This function gets called instead of the test runner one
     * An HTTP server opens and exposes all defined handlers in the {@code Handlers} enum
     */
    @RuntimeType
    public static Object childrenInvoker(Object notifier, @This Object cucumber) {
        log.info("Running children invoker");
        fillValues(cucumber);
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(AgentConfiguration.getUsedTCPPort()), Handlers.values().length);
            for (Handlers val : Handlers.values()) {
                server.createContext(val.getHandler().getPath(), val.getHandler()::handle);
                log.info(String.format("Registered path %s@%s", val.getHandler().getPath(), val.getHandler().getClass().getName()));
                System.out.printf("Registered path %s@%s%n", val.getHandler().getPath(), val.getHandler().getClass().getName());
            }
            server.start();

        } catch (Exception e) {
            e.printStackTrace();
        }
        Thread.currentThread().suspend();
        return new Object();
    }

    public static List<Object> getChildren() {
        return null;
    }

    public static String toStr() {
        return "Hello world";
    }

    @Advice.OnMethodExit
    public static void constructor(Class<?> clazz) throws Exception {
        Class<?> clz = clazz;
        while (clz != null) {
            for (Method method : clz.getDeclaredMethods()) {
                for (Annotation annotation : method.getDeclaredAnnotations()) {
                    if (annotation.annotationType().getTypeName().contains("BeforeClass")) {
                        method.invoke(null);
                        break;
                    }
                }
            }
            clz = clz.getSuperclass();
        }
    }
}
