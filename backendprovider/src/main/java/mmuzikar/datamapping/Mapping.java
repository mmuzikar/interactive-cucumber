package mmuzikar.datamapping;

import java.lang.annotation.*;

@Target(ElementType.FIELD)
@Repeatable(Mappings.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Mapping {
    String declaredVersion();

    String fieldName() default "";
    Class<? extends Mapper> mapper() default DefaultMapper.class;
}
