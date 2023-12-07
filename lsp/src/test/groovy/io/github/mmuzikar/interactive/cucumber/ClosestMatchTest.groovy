package io.github.mmuzikar.interactive.cucumber

import static org.assertj.core.api.Assertions.assertThat

import static io.github.mmuzikar.interactive.cucumber.utils.StepDefUtils.withPattern

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test

import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.data.MockCucumber
import io.github.mmuzikar.interactive.cucumber.lsp.completion.ClosestStepFinder

@Disabled("This functionality is no longer needed")
class ClosestMatchTest {

    static ClosestStepFinder stepFinder
    static Cucumber cucumber

    static CLICK_ON_STRING = withPattern("click on {string}")
    static USER_CLICKS_ON_STRING = withPattern("user clicks on {string}")
    static TODAY_IS = withPattern(~/^today is ([0-9]{4}-[0-9]{2}-[0-9]{2})$/)
    static PAGE_REFRESHES = withPattern("page refreshes")


    @BeforeAll
    static void setup() {
        cucumber = new MockCucumber([CLICK_ON_STRING, USER_CLICKS_ON_STRING, TODAY_IS, PAGE_REFRESHES], [], null)
        stepFinder = new ClosestStepFinder(cucumber)
    }

    @Test
    void happyPath() {
        assertThat(findClosestStepDefinition('click on ""'))
            .isEqualTo(CLICK_ON_STRING)

        assertThat(findClosestStepDefinition('clicks on ""'))
            .isEqualTo(USER_CLICKS_ON_STRING)

        assertThat(findClosestStepDefinition("user"))
            .isEqualTo(USER_CLICKS_ON_STRING)

        assertThat(findClosestStepDefinition("today"))
            .isEqualTo(TODAY_IS)
    }

    @Test
    void noMatch() {
        assertThat(findClosestStepDefinition("asdf"))
            .isNull()
    }

    static StepDefinition findClosestStepDefinition(String text) {
        stepFinder.findClosestStepDefinition(text)
    }
}
