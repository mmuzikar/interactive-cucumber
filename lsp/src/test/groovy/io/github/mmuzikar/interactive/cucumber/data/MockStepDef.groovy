package io.github.mmuzikar.interactive.cucumber.data

import java.lang.reflect.Method
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.regex.Pattern

import io.cucumber.datatable.DataTable
import io.github.mmuzikar.interactive.cucumber.agent.CucumberSuggestionProviderResolver
import io.github.mmuzikar.interactive.cucumber.agent.data.Argument
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.agent.utils.PatternToSnippetConverter
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver

class MockStepDef implements StepDefinition {

    String pattern
    String location
    Argument[] args
    String docs
    String[] tags
    Method method

    Closure<Void> delegate

    static final SuggestionProviderResolver resolver = new MockSuggestionProviderResolver()

    MockStepDef(String pattern, String location = "inmem", Argument[] args = [], String docs = "", String[] tags = [], Closure<Void> method = MockStepDef::noop) {
        this.pattern = pattern
        this.location = location
        this.args = args
        this.docs = docs
        this.tags = tags

        this.delegate = method
    }

    MockStepDef(Map map, String pattern) {
        this(pattern, map.get('location', 'inmem'), map.get('args', [] as Argument[]), map.get('docs', ''), map.get('tags', [] as String[]), map.get('method', MockStepDef::noop))
    }

    private static void noop() {

    }

    @Override
    boolean hasDatatable() {
        return args.last().type == DataTable.class.name
    }

    private boolean isRegexPattern() {
        pattern instanceof Pattern || (pattern.startsWith("^") && pattern.endsWith('$'))
    }

    String toSnippetPattern() {
        if (isRegexPattern()) {
            PatternToSnippetConverter.snippetFromRegex(pattern)
        } else {
            PatternToSnippetConverter.snippetFromGherkin(pattern)
        }
    }

    @Override
    boolean matches(String s) {
        if (pattern instanceof Pattern) {
            s.matches(pattern)
        } else {
            throw new UnsupportedOperationException()
        }
    }

    @Override
    String toString() {
        return "MockStepDef{" +
                "pattern=" + pattern +
                ", location='" + location + '\'' +
                ", args=" + Arrays.toString(args) +
                ", docs='" + docs + '\'' +
                ", tags=" + Arrays.toString(tags) +
                '}';
    }
}
