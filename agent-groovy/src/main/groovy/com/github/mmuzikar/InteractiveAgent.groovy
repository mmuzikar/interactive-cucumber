//
// Generated from archetype; please customize.
//

package com.github.mmuzikar

import java.lang.instrument.Instrumentation

/**
 * Example Groovy class.
 */
class InteractiveAgent {

	static void premain(String arg, Instrumentation instrumentation) {
//        Configuration.readConfig(arg);

//        new AgentBuilder.Default()
//                .with(AgentBuilder.TypeStrategy.Default.REDEFINE)
//                .with(AgentBuilder.InjectionStrategy.UsingReflection.INSTANCE)
//                .with(AgentBuilder.Listener.StreamWriting.toSystemError())
////                .ignore(ElementMatchers.nameContains("com.google.inject"))
//                .type(ElementMatchers.named("cucumber.api.junit.Cucumber").or(ElementMatchers.named("io.cucumber.junit.Cucumber")))
//                .transform({ builder, typeDescription, classLoader, module ->
//                    println("Transforming: " + typeDescription.getName());
//                    return builder.method(ElementMatchers.named("childrenInvoker"))
//                            .intercept(MethodDelegation.to(CucumberInterceptor.class));
////                            .visit(Advice.to(CucumberInterceptor.class).on(ElementMatchers.isConstructor()));
//                } as AgentBuilder.Transformer).installOn(instrumentation);
//
//        new AgentBuilder.Default()
//                .with(AgentBuilder.TypeStrategy.Default.REDEFINE)
//                .with(AgentBuilder.InjectionStrategy.UsingReflection.INSTANCE)
//                .with(AgentBuilder.Listener.StreamWriting.toSystemError().withErrorsOnly())
//                .ignore(ElementMatchers.nameContains("com.google.inject"))
//                .type(ElementMatchers.any())
//                .transform({ builder, typeDescription, classLoader, module ->
//                    typeDescription.declaredMethods.each {
//                        if (it.declaredAnnotations.isAnnotationPresent(DataSuggestion)) {
//                            println "Following class registers Dataformat ${typeDescription.name}"
//                            println "${it.name}"
//                            def annotation = it.declaredAnnotations.ofType(DataSuggestion).load()
//                            CucumberInterceptor.suggestionProviders.push([it.returnType.typeName, annotation.value()])
//                        }
//                    }
//                    return builder
//                } as AgentBuilder.Transformer).installOn(instrumentation);
	}

	def show() {
		println 'Hello World'
	}
}
