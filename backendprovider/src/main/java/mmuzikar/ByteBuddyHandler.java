package mmuzikar;

import lombok.extern.java.Log;
import net.bytebuddy.agent.builder.AgentBuilder;
import net.bytebuddy.asm.Advice;
import net.bytebuddy.description.method.MethodDescription;
import net.bytebuddy.implementation.MethodCall;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.matcher.ElementMatchers;
import mmuzikar.interceptors.CucumberInterceptor;

import java.lang.instrument.Instrumentation;

@Log
public class ByteBuddyHandler {

    public void handleArguments(String args){
        //noop?
    }


    public void registerTransformations(Instrumentation instrumentation) {
        log.info("AGENT INSTALLED");
        //Instruct childrenInvoker method to call one from CucumberInterceptor instead
        new AgentBuilder.Default()
                .with(AgentBuilder.TypeStrategy.Default.REDEFINE)
                .with(AgentBuilder.InjectionStrategy.UsingReflection.INSTANCE)
                .with(AgentBuilder.Listener.StreamWriting.toSystemError().withErrorsOnly())
                .type(ElementMatchers.named("cucumber.api.junit.Cucumber").or(ElementMatchers.named("io.cucumber.junit.Cucumber")))
                .transform((builder, typeDescription, classLoader, module) -> {
                    log.info("Transforming: " + typeDescription.getName());
                    return builder.method(ElementMatchers.named("childrenInvoker"))
                            .intercept(MethodDelegation.to(CucumberInterceptor.class))
                            .visit(Advice.to(CucumberInterceptor.class).on(ElementMatchers.isConstructor()));
                }).installOn(instrumentation);
        //Leftover Expose tries
        /*
        new AgentBuilder.Default()
                .with(AgentBuilder.TypeStrategy.Default.REDEFINE)
                .with(AgentBuilder.InjectionStrategy.UsingReflection.INSTANCE)
                //.with(AgentBuilder.Listener.StreamWriting.toSystemError())
                .type(ElementMatchers.any())
                .transform((builder, typeDescription, classLoader, module) -> {
                    List<MethodDescription.InDefinedShape> methods = typeDescription.getDeclaredMethods().stream().filter(inDefinedShape -> inDefinedShape.getDeclaredAnnotations().isAnnotationPresent(Expose.class)).collect(Collectors.toList());
                    if (!methods.isEmpty()){
                        log.info("Exposed methods: " + methods);
                    }
                    return builder;
                }).installOn(instrumentation);
        new AgentBuilder.Default()
                .with(AgentBuilder.TypeStrategy.Default.REDEFINE)
                .with(AgentBuilder.InjectionStrategy.UsingReflection.INSTANCE)
                //.with(AgentBuilder.Listener.StreamWriting.toSystemError())
                .type(ElementMatchers.isAnnotatedWith(Expose.class))
                .transform((builder, typeDescription, classLoader, module) -> {
                    log.info("Found expose object " + typeDescription.getName());
                    return builder.constructor(ElementMatchers.any())
                            .intercept(MethodDelegation.to(ExposeInterceptor.class));
                }).installOn(instrumentation);
        */
    }

}
