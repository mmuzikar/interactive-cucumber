package com.github.mmuzikar.data

import io.cucumber.core.gherkin.Step
import io.cucumber.core.gherkin.StepType
import io.cucumber.plugin.event.Location

class InMemoryStep implements Step{

    String text
    io.cucumber.core.gherkin.Argument argument

    InMemoryStep(String text){
        if (text.contains("\n")){
            def parts = text.split("\n")
            this.text = parts[0]
            def isDocstring = parts[1].trim().startsWith("\"\"\"")
            if (isDocstring){
                argument = new InMemoryDocString(parts[1..parts.length-1].join("\n"))
            } else {
                argument = new InMemoryDatatable(parts[1..parts.length-1].join("\n"))
            }
        } else {
            this.text = text
        }
    }

    StepType getType() {
        return StepType.WHEN
    }

    String getPreviousGivenWhenThenKeyword() {
        return "when"
    }

    String getId() {
        return UUID.randomUUID().toString()
    }

    io.cucumber.core.gherkin.Argument getArgument() {
        return argument
    }

    String getKeyword() {
        return "when"
    }

    String getText() {
        return text
    }

    int getLine() {
        return 0
    }

    Location getLocation() {
        return null
    }
}
