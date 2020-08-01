package mmuzikar.datamapping;

import lombok.NoArgsConstructor;
import mmuzikar.utils.ReflectionUtils;

@NoArgsConstructor
public class Runtime extends BaseMappingObject {

    @Mapping(declaredVersion = "2.4.x", fieldName = "runtime.runner.glue")
    @Mapping(declaredVersion = "6.2.x", fieldName = "context.runnerSupplier.get().glue")
    public Glue glue;

    public static Runtime from(Object object) {
        return new Runtime().from(object, Runtime.class);
    }

    @CallWhenVersion("6.2.x")
    protected void invokeContext(Object original) {
        Object context = ReflectionUtils.get(original, "context");
        assert context != null;
        ReflectionUtils.callOnObject(context, "startTestRun");
    }
}
