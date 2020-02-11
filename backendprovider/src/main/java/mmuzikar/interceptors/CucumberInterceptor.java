package mmuzikar.interceptors;

import com.sun.net.httpserver.HttpServer;
import cucumber.runtime.Glue;
import cucumber.runtime.Runtime;
import cucumber.runtime.junit.FeatureRunner;
import lombok.Getter;
import lombok.extern.java.Log;
import net.bytebuddy.implementation.bind.annotation.RuntimeType;
import net.bytebuddy.implementation.bind.annotation.This;
import org.junit.runner.notification.RunNotifier;
import org.junit.runners.model.InitializationError;
import org.junit.runners.model.Statement;
import mmuzikar.AgentConfiguration;
import mmuzikar.handlers.Handlers;
import mmuzikar.processors.StepDefProcessor;

import java.io.IOException;
import java.lang.reflect.Field;
import java.net.InetSocketAddress;
import java.util.List;

@Log
public class CucumberInterceptor {

    @Getter
    private static Glue glue;

    @Getter
    private static Runtime runtime;

    private static String lastMessage;

    private static void fillValues(Object cucumber){
        try {
            Field f;
            f = cucumber.getClass().getDeclaredField("runtime");
            f.setAccessible(true);
            runtime = ((Runtime) f.get(cucumber));
            glue = runtime.getGlue();
            glue.reportStepDefinitions(StepDefProcessor::process);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RuntimeType
    public static Statement childrenInvoker(RunNotifier notifier, @This Object cucumber) {
        log.info("Running children invoker");
        fillValues(cucumber);
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(AgentConfiguration.getUsedTCPPort()), 2);
            for (Handlers val : Handlers.values()) {
                server.createContext(val.getHandler().getPath(), val.getHandler()::handle);
                log.info(String.format("Registered path %s@%s", val.getHandler().getPath(), val.getHandler().getClass().getName()));
            }
            server.start();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return new Statement() {
            @Override
            public void evaluate() throws Throwable {
                while(!"quit".equalsIgnoreCase(lastMessage)){
                    Thread.sleep(1000);
                }
            }
        };
    }

    public static void Cucumber(Class clazz) throws InitializationError, IOException {
        log.info("Constructing Cucumber");
    }

    public static List<FeatureRunner> getChildren() {
        return null;
    }

    public static String toStr(){
        return "Hello world";
    }
}
