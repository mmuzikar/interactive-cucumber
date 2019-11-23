package xmuzik06.processors;

import cucumber.runtime.StepDefinition;
import lombok.Getter;
import xmuzik06.data.StepDefPOJO;
import xmuzik06.utils.ReflectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class StepDefProcessor {

    @Getter
    public static final List<StepDefPOJO> stepDefs = new ArrayList<>();

    public static void process(Object o){
        StepDefPOJO stepDef =  ReflectionUtils.dynamicCast(o, StepDefPOJO.class);
        ReflectionUtils.setFrom(o, stepDef, "pattern", "pattern", Pattern::toString);
        stepDef.setOrigStepDef(((StepDefinition) o));
        stepDef.loadStepDefArgs();
        stepDefs.add(stepDef);
    }

}
