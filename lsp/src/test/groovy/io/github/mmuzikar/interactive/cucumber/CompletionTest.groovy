package io.github.mmuzikar.interactive.cucumber

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test

import org.assertj.core.api.Assertions
import org.assertj.core.api.ListAssert
import org.eclipse.lsp4j.CompletionItem
import org.eclipse.lsp4j.CompletionList
import org.eclipse.lsp4j.CompletionParams
import org.eclipse.lsp4j.DidChangeTextDocumentParams
import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.TextDocumentContentChangeEvent
import org.eclipse.lsp4j.TextDocumentIdentifier
import org.eclipse.lsp4j.VersionedTextDocumentIdentifier
import org.eclipse.lsp4j.jsonrpc.messages.Either

import java.util.function.Consumer

import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.data.MockCucumber
import io.github.mmuzikar.interactive.cucumber.lsp.InteractiveCucumberServices
import io.github.mmuzikar.interactive.cucumber.lsp.completion.CucumberCompletionProvider
import io.github.mmuzikar.interactive.cucumber.utils.StepDefUtils

@Disabled("The completion provider now requires more context that has to be mocked")
class CompletionTest {

    static InteractiveCucumberServices cucumberServices
    static Cucumber cucumber

    @BeforeAll
    static void beforeAll() {
        cucumber = new MockCucumber(StepDefUtils.MOCK_STEPS, [], null)
        cucumberServices = new InteractiveCucumberServices(cucumber)
    }

    @Test
    void happyPath() {
        completionTest("""
    Given ^
""", StepDefUtils.MOCK_STEPS.collect {
            it.toSnippetPattern()
        }
        )
    }

    @Test
    void keyWordTest() {
        completionTest("^", CucumberCompletionProvider.KEYWORDS)
    }

    @Test
    void completedStepTest() {
        completionTest('Given page refreshes ^', [])
    }

    @Test
    void suggestionTest() {
        completionTest('Given click on "^"', {
            it.allMatch {
                StepDefUtils.SuggestionProviders.LinkNameSP.LINKS.contains(it.insertText) &&
                        it.label.startsWith("Arg(0): ")
            }
        })
    }

    static void completionTest(String source, List<String> expected) {
        completionTest(source, {
            it.extracting('label').containsAll(expected)
        })
    }

    static void completionTest(String source, Consumer<ListAssert<CompletionItem>> validation) {
        setupWorkspace(source)

        def completion = cucumberServices.completion(new CompletionParams(new TextDocumentIdentifier("mock:source"), getCaretPosition(source)))

        def items = extractResponse(completion.get())

        validation(Assertions.assertThat(items))
    }

    static List<CompletionItem> extractResponse(Either<List<CompletionItem>, CompletionList> either) {
        return either.map({
            return it
        }, {
            return it.items
        })
    }

    static void setupWorkspace(String source) {
        cucumberServices.didChange(
                new DidChangeTextDocumentParams(
                        new VersionedTextDocumentIdentifier("mock:source", 1), [
                        new TextDocumentContentChangeEvent(source.replace('^', ''))
                ]))
    }

    static Position getCaretPosition(String source) {
        def lines = source.readLines()
        def lineId = lines.findIndexOf {
            it.indexOf('^') != -1
        }

        def character = lines.get(lineId).indexOf("^")

        return new Position(lineId, character)
    }
}
