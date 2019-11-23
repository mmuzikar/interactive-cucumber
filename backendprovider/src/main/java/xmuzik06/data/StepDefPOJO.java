package xmuzik06.data;

import cucumber.runtime.StepDefinition;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import xmuzik06.annotations.Suggestion;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

@AllArgsConstructor
@NoArgsConstructor
public class StepDefPOJO {
    @Getter
    private String pattern;
    @Getter
    private CucumberArg[] args = null;
    @Getter
    private String location;

    @Getter
    private transient Method method;

    @Setter
    @Getter
    private transient StepDefinition origStepDef;

    public void setMethod(Method method) {
        this.method = method;
        loadStepDefArgs();
    }

    public void loadStepDefArgs() {
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

}
