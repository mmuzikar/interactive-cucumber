package mmuzikar.interceptors;

import com.google.auto.service.AutoService;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.lang.model.type.ExecutableType;
import java.util.Set;

@SupportedAnnotationTypes("mmuzikar.api.Expose")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
public class ExposeInterceptor extends AbstractProcessor {

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (TypeElement annotation : annotations){
            Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);
            annotatedElements.forEach(o ->{
                switch (o.getKind()){
                    case METHOD:
                        ExecutableType exec = ((ExecutableType) o);

                        break;
                    case CLASS:

                        break;

                    case FIELD:

                        break;
                }
            });
        }
        return false;
    }
}
