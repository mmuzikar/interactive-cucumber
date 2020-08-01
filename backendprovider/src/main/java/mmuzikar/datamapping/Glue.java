package mmuzikar.datamapping;

import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Consumer;

@AllArgsConstructor
public class Glue extends BaseMappingObject {

    @Mapping(declaredVersion = "2.4.x", fieldName = "stepDefinitionsByPattern")
    @Mapping(declaredVersion = "6.2.x", fieldName = "stepDefinitions", mapper = MapConverter.class)
    public Map<String, StepDefinition> stepDefinitionsByPattern;

    public void reportStepDefinitions(Consumer<StepDefinition> func) {
        stepDefinitionsByPattern.values().forEach(func);
    }

    private static final class MapConverter implements Mapper<List<StepDefinition>, Map<String, StepDefinition>> {
        @Override
        public Map<String, StepDefinition> convert(List<StepDefinition> o) {
            Map<String, StepDefinition> map = new TreeMap<>();
            o.forEach(stepDef -> map.put(stepDef.pattern.toString(), stepDef));
            return map;
        }
    }
}


