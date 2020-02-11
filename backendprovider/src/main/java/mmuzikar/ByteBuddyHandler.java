package mmuzikar;

import lombok.extern.java.Log;
import net.bytebuddy.agent.builder.AgentBuilder;
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
        /*
        new AgentBuilder.Default()
//                .with(AgentBuilder.RedefinitionStrategy.RETRANSFORMATION)
                .type(ElementMatchers.named("mmuzikar.TestObject"))
                .transform((builder, typeDescription, classLoader, module) ->
                        builder.method(ElementMatchers.isToString())
                                .intercept(MethodDelegation.to(TestInterceptor.class))
                                .defineField("injectedField", Object.class, Modifier.PUBLIC | Modifier.STATIC)
                ).installOn(instrumentation);

         */
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
