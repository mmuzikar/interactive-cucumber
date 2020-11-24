package mmuzikar.datamapping;

import lombok.Getter;
import mmuzikar.api.Suggestion;
import mmuzikar.data.CucumberArg;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Arrays;
import java.util.regex.Pattern;

public class StepDefinition extends BaseMappingObject {

    @Mapping(declaredVersion = "2.4.x", fieldName = "pattern")
    @Mapping(declaredVersion = "6.2.x", fieldName = "expression", mapper = Mappers.StringToPatternMapper.class)
    public Pattern pattern;

    @Mapping(declaredVersion = "2.4.x", fieldName = "method")
    @Mapping(declaredVersion = "6.2.x", fieldName = "method")
    public transient Method method;

    public String location;

    public CucumberArg[] args;
    @Getter
    private transient Object origStepDef;

    private transient static boolean wasLookupStarted = false;

    @CallWhenVersion("x.x.x")
    public void loadStepDefArgs(Object origStepDef) {
        if (!(origStepDef instanceof StepDefinition)) {
            this.origStepDef = origStepDef;
        }
        if (method == null)
            return;
        int paramCount = method.getParameterCount();
        args = new CucumberArg[paramCount];
        for (int i = 0; i < paramCount; i++) {
            args[i] = new CucumberArg(method.getParameterTypes()[i].getName());
            try {
                Parameter param = method.getParameters()[i];
                Suggestion sug = param.getAnnotation(Suggestion.class);
                if (sug != null) {
                    args[i].setSuggProvider(sug.value().getTypeName());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void tryStartLookup() {
        if (!wasLookupStarted) {
            try {
                Field lookupF = origStepDef.getClass().getSuperclass().getDeclaredField("lookup");
                lookupF.setAccessible(true);
                Object lookup = lookupF.get(origStepDef);
                Method startMethod = lookup.getClass().getDeclaredMethod("start");
                startMethod.setAccessible(true);
                startMethod.invoke(lookup);
                wasLookupStarted = true;
            } catch (Exception ignored) {

            }
        }
    }

    public void execute(Object... params) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException, InstantiationException {
        tryStartLookup();
        Object[] args = new Object[params.length];
        System.arraycopy(params, 0, args, 0, args.length);
        try {
            Method execute = origStepDef.getClass().getDeclaredMethod("execute", String.class, Object[].class);
            execute.setAccessible(true);
            execute.invoke(origStepDef, "en", params);
        } catch (Exception e) {
            try {
                Method execute = origStepDef.getClass().getDeclaredMethod("execute", Object[].class);
                Method invokeMethod = origStepDef.getClass().getSuperclass().getDeclaredMethod("invokeMethod", Object[].class);
                invokeMethod.setAccessible(true);
                execute.setAccessible(true);
                System.out.println("Invoking method with args: " + Arrays.toString(args));
                execute.invoke(origStepDef, args);
            } catch (Exception ex){
                method.invoke(method.getDeclaringClass().newInstance(), args);
            }
        }
    }
}
