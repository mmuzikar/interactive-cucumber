package xmuzik06;

import lombok.extern.java.Log;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.implementation.MethodCall;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.jar.asm.ClassReader;
import net.bytebuddy.jar.asm.ClassWriter;
import net.bytebuddy.matcher.ElementMatchers;
import xmuzik06.interceptors.CucumberInterceptor;

import java.lang.instrument.Instrumentation;
import java.lang.reflect.Modifier;

@Log
public class ByteBuddyHandler implements IAgent {

    @Override
    public void registerTransformations(Instrumentation instrumentation) {
        log.info("AGENT INSTALLED");
        new AgentBuilder.Default()
//                .with(AgentBuilder.RedefinitionStrategy.RETRANSFORMATION)
                .type(ElementMatchers.named("xmuzik06.TestObject"))
                .transform((builder, typeDescription, classLoader, module) ->
                        builder.method(ElementMatchers.isToString())
                                .intercept(MethodDelegation.to(TestInterceptor.class))
                                .defineField("injectedField", Object.class, Modifier.PUBLIC | Modifier.STATIC)
                ).installOn(instrumentation);
        new AgentBuilder.Default()
                .with(AgentBuilder.TypeStrategy.Default.REDEFINE)
                .with(AgentBuilder.InjectionStrategy.UsingReflection.INSTANCE)
                //.with(AgentBuilder.Listener.StreamWriting.toSystemError())
                .type(ElementMatchers.named("cucumber.api.junit.Cucumber"))
                .transform((builder, typeDescription, classLoader, module) -> {
                    log.info("Transforming: " + typeDescription.getName());
                    return builder.method(ElementMatchers.named("childrenInvoker"))
                            .intercept(MethodDelegation.to(CucumberInterceptor.class));
                }).installOn(instrumentation);
    }

    @Log
    public static class SelenideInterceptor {

        public void open(@Advice.AllArguments Object... arguments) {
            log.info("Called method with parameters " + arguments.toString());
        }

    }

    public static class TestInterceptor {
        public static String toStr() {
            return "Agent interjected";
        }
    }

}
