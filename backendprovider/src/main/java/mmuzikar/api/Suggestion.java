package mmuzikar.api;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

//@Target(ElementType.TYPE_USE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Suggestion {

    Class<? extends ISuggestionProvider> value();

}
