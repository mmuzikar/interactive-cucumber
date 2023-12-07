package io.github.mmuzikar.interactive.cucumber.lsp.completion

import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.agent.utils.PatternToSnippetConverter
import me.xdrop.fuzzywuzzy.FuzzySearch
import me.xdrop.fuzzywuzzy.ToStringFunction
import me.xdrop.fuzzywuzzy.model.BoundExtractedResult

class ClosestStepFinder {

    static final int CONFIDENCE = 85
    static final int ACCEPTABLE_DIF = 5

    Cucumber cucumber

    ClosestStepFinder(Cucumber cucumber) {
        this.cucumber = cucumber
    }

    <T extends StepDefinition> T[] findClosestStepDefinition(String text,
                                                           Collection<T> source = cucumber.glue.stepDefinitions,
                                                           ToStringFunction<T> toStringFunc = StepDefinition::toSnippetPattern as ToStringFunction) {
        def matches = FuzzySearch.extractSorted(text, source, toStringFunc, CONFIDENCE)

        if (matches.empty) {
            return null
        }

        def exactMatch = matches.first().find {
            PatternToSnippetConverter.removePatterns(it.string) == text
        } as BoundExtractedResult<T>

        if (exactMatch) {
            return exactMatch.referent
        }

        if (matches.size() == 1) {
            return matches.first().referent
        }

        return matches.collect {it.referent}
    }
}
