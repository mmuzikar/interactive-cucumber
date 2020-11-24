package mmuzikar.datamapping;

public class Cucumber extends BaseMappingObject {

    @Mapping(declaredVersion = "2.4.x", fieldName = "runtime")
    @Mapping(declaredVersion = "6.2.x", fieldName = "context")
    public Runtime runtime;
}
