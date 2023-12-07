package io.github.mmuzikar.interactive.cucumber.agent.data.impl

import io.cucumber.core.gherkin.Step
import io.cucumber.core.gherkin.StepType
import io.cucumber.plugin.event.Location
import io.github.mmuzikar.interactive.cucumber.lsp.completion.CucumberCompletionProvider

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
        def matcher = text =~ CucumberCompletionProvider.STEP_PATTERN
        if (matcher) {
            //Remove the keyword and use just the step text
            this.text = matcher.group(1)
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
