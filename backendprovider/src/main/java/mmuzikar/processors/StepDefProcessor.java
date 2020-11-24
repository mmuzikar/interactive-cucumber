package mmuzikar.processors;

import lombok.Getter;
import mmuzikar.datamapping.BaseMappingObject;
import mmuzikar.datamapping.StepDefinition;

import java.util.ArrayList;
import java.util.List;

public class StepDefProcessor {

    @Getter
public static final List<StepDefinition> stepDefs = new ArrayList<>();

    //here functionality for extracting a step definition for any cucumber version should reside
    public static void process(StepDefinition stepDef) {
        //TODO: different code structure for 3x+
        stepDefs.add(stepDef);
    }

}
