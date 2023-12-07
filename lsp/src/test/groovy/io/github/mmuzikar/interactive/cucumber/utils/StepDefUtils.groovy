package io.github.mmuzikar.interactive.cucumber.utils

import java.util.regex.Pattern

import io.github.mmuzikar.interactive.cucumber.agent.data.Argument
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider
import io.github.mmuzikar.interactive.cucumber.data.MockStepDef

class StepDefUtils {

    static int stepDefId = 0

    static StepDefinition withPattern(String pattern) {
        new MockStepDef(pattern, "mock:${stepDefId++}", [] as Argument[], "", [] as String[], null)
    }

    static StepDefinition withPattern(Pattern pattern) {
        withPattern(pattern.pattern())
    }

    static List<StepDefinition> MOCK_STEPS = [
            new MockStepDef("click on {string}", args: [new Argument(String.class.name, SuggestionProviders.LinkNameSP.name)], method: StepDefs::clickOnLink),
            new MockStepDef("user clicks on {string}", args: [new Argument(String.class.name, SuggestionProviders.LinkNameSP.name)], method: StepDefs::clickOnLink),
            new MockStepDef("navigate to page {string}", args: [new Argument(String.name)]),
            withPattern("page refreshes"),
            withPattern(~/^today is ([0-9]{4}-[0-9]{2}-[0-9]{2})$/),
            withPattern(~/^I ask if ([0-9]{4}-[0-9]{2}-[0-9]{2}) is in the past$/),
            withPattern("click on the confirm button")
    ]

    private static class StepDefs {

        static void clickOnLink(String name) {

        }
    }

    static class SuggestionProviders {
        static class LinkNameSP implements SuggestionProvider {

            static final LINKS = ["link 1", "link 2", "link 3"]

            @Override
            List<SuggestionItem> provide(String step) {
                return LINKS.collect { new SuggestionItem(it)}
            }
        }
    }
}
