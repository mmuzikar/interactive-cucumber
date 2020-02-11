package mmuzikar.processors;

import cucumber.runtime.StepDefinition;
import lombok.Getter;
import mmuzikar.data.StepDefPOJO;
import mmuzikar.utils.ReflectionUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class StepDefProcessor {

    @Getter
    public static final List<StepDefPOJO> stepDefs = new ArrayList<>();

    public static void process(Object o){
        //TODO: different code structure for 3x+
        StepDefPOJO stepDef =  ReflectionUtils.dynamicCast(o, StepDefPOJO.class);
        if (ReflectionUtils.hasField(o, "pattern")){
            ReflectionUtils.setFrom(o, stepDef, "pattern", "pattern", Pattern::toString);
        } else if (ReflectionUtils.hasField(o, "expression")){
            Object cucumberExp = ReflectionUtils.get(o, "expression");
            Object exp = ReflectionUtils.get(cucumberExp, "expression");
            ReflectionUtils.setFrom(exp, stepDef,  "expressionRegexp", "pattern", Pattern::toString);
        }
        stepDef.setOrigStepDef(((StepDefinition) o));
        stepDef.loadStepDefArgs();
        stepDefs.add(stepDef);
    }

}
