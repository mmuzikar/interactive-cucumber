package com.github.mmuzikar.data

import io.cucumber.core.backend.HookDefinition
import io.cucumber.plugin.event.TestStep

class Glue implements GroovyObject {

    List<StepDef> stepDefinitions;
    def origObject;
    def runner

    Glue(origObject, runner){
        stepDefinitions = origObject.stepDefinitions.collect {
            new StepDef(it)
        }
        this.origObject = origObject;
        this.runner = runner
    }

    List<TestStep> getBeforeHooks(){
        runner.createTestStepsForBeforeHooks([])
    }

    List<HookDefinition> getBeforeStepHooks() {
        origObject.beforeStepHooks.collect {
            it.delegate
        }
    }
    List<TestStep> getAfterHooks(){
        runner.createTestStepsForAfterHooks([])
    }

    List<HookDefinition> getAfterStepHooks() {
        origObject.afterStepHooks.collect {
            it.delegate
        }
    }
}
