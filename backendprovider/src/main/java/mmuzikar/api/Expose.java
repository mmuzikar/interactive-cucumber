package mmuzikar.api;

import mmuzikar.processors.ExposeProcessor;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
    Expose annotation was meant to be used as a way to providing
    interoperability between the UI and the Java test suite. 
    It proved to be more difficult, see ExposeInterceptor for annotation processor skeleton
    in ExposeProcessor all exposed instances (be it objects, methods etc.) would reside. 
*/
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Expose {
    String id() default "";
    Class<? extends IExposedNameProvider> nameProvider() default IOriginalNameProvider.class;

    class IOriginalNameProvider implements IExposedNameProvider {
        @Override
        public String getNameFor(Object obj) {
            String name =obj.getClass().getName();
            if (ExposeProcessor.INSTANCE.isDefined(name)){
                int i = 0;
                while(!ExposeProcessor.INSTANCE.isDefined(name + "$" + i)){
                    i++;
                }
            }
            return name;
        }
    }
}
