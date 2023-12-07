package io.github.mmuzikar.interactive.cucumber.agent.data

import io.cucumber.core.gherkin.Feature
import io.cucumber.core.gherkin.Step

class FeatureData {
    String uri
    String name
    ScenarioData[] scenarios

    FeatureData(Feature feature) {
        this.uri = feature.uri.toString()
        this.name = feature.name.orElse(null)

        this.scenarios = feature.pickles.collect {
            new ScenarioData(it.name, it.steps, it.tags)
        }
    }

    class ScenarioData {
        List<StepData> steps
        String name
        String[] tags

        ScenarioData(String name, List<Step> steps, List<String> tags) {
            this.steps = steps.collect {
                new StepData(it.keyword + it.text, it.location.line)
            }
            this.name = name
            this.tags = tags
        }
    }

    class StepData {
        String step
        int line

        StepData(String step, int line) {
            this.step = step
            this.line = line
        }
    }
}
