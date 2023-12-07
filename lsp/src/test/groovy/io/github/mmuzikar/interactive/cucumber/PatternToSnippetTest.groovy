package io.github.mmuzikar.interactive.cucumber

import static org.assertj.core.api.Assertions.assertThat

import static io.github.mmuzikar.interactive.cucumber.agent.utils.PatternToSnippetConverter.snippetFromGherkin
import static io.github.mmuzikar.interactive.cucumber.agent.utils.PatternToSnippetConverter.snippetFromRegex

import org.junit.jupiter.api.Test

class PatternToSnippetTest {

    @Test
    void gherkinHappyPath() {
        assertThat(snippetFromGherkin("click on {string} link"))
            .isEqualTo('click on "${1:string}" link$0')

        assertThat(snippetFromGherkin("click on {} link"))
            .isEqualTo('click on ${1:} link$0')

        assertThat(snippetFromGherkin("click on {string} {string}"))
            .isEqualTo('click on "${1:string}" "${2:string}"$0')
    }

    @Test
    void testRegexHappyPath() {
        assertThat(snippetFromRegex('click on "([^"]*)" link'))
            .isEqualTo('click on "$1" link$0')
    }

    @Test
    void removeStartAndEndCaptures() {
        assertThat(snippetFromRegex('^click on "([^"]*)" link$'))
                .isEqualTo('click on "$1" link$0')
    }
}
