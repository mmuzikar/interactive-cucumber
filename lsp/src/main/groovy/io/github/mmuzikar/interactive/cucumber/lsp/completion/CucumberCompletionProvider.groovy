package io.github.mmuzikar.interactive.cucumber.lsp.completion

import org.eclipse.lsp4j.Command
import org.eclipse.lsp4j.CompletionItem
import org.eclipse.lsp4j.CompletionItemDefaults
import org.eclipse.lsp4j.CompletionItemKind
import org.eclipse.lsp4j.CompletionList
import org.eclipse.lsp4j.CompletionParams
import org.eclipse.lsp4j.InsertTextFormat
import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.TextEdit
import org.eclipse.lsp4j.jsonrpc.messages.Either
import org.eclipse.lsp4j.services.LanguageClient

import java.util.concurrent.CompletableFuture

import io.github.mmuzikar.interactive.cucumber.Main
import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem
import io.github.mmuzikar.interactive.cucumber.lsp.storage.FileSystem

class CucumberCompletionProvider {

    static final def KEYWORDS = ['Given', 'When', 'Then', 'And', 'But', 'Feature: ', 'Scenario: ']
    static def STEP_PATTERN = ~/(?:Given|When|Then|And|But)\s(.*)/

    Cucumber cucumber
    ClosestStepFinder finder
    private LanguageClient languageClient
    private FileSystem fs

    CucumberCompletionProvider(Cucumber cucumber, LanguageClient languageClient, FileSystem fs) {
        this.cucumber = cucumber
        this.finder = new ClosestStepFinder(cucumber)
        this.languageClient = languageClient
        this.fs = fs
    }

    CompletableFuture<Either<List<CompletionItem>, CompletionList>> provide(String line, CompletionParams params) {
        def suggestions = []

        def metadata = fs.getMetadata(params.textDocument.uri, params.position)

        def stepMatcher = line =~ STEP_PATTERN

        if (stepMatcher) {
            def argumentSuggestions = provideArgumentSuggestions(stepMatcher.group(1), params.position.character, metadata)
            if (argumentSuggestions) {
                suggestions.addAll(argumentSuggestions)
            } else {
                suggestions.addAll(provideStepDefinitions(line))
            }
        } else if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
            //Assume datatable
            def lineNumber = params.position.line
            def lines = fs.getText(params.textDocument.uri).readLines()
            for (int i = lineNumber; i >= 0; i--) {
                def precedingLine = lines[i]
                if (precedingLine =~ STEP_PATTERN) {
                    def m = fs.getMetadata(params.textDocument.uri, i)
                    def stepDefMetadata = m.find { it.type == "StepDefinition" }
                    if (!stepDefMetadata) {
                        break
                    }
                    def stepDef = cucumber.glue.findStepDefinition(stepDefMetadata.data)
                    if (stepDef && stepDef.hasDatatable()) {
                        def dataTable = stepDef.args.last()
                        if (dataTable.datatableSuggestionProvider) {
                            def startLineNum = i + 1
                            def endLineNum = lineNumber
                            while (endLineNum + 1 < lines.size()) {
                                def l = lines[endLineNum + 1].trim()
                                if ((l.startsWith('|') && l.endsWith('|')) || l.startsWith("#")) {
                                    endLineNum++
                                } else {
                                    break
                                }
                            }
                            def dataLines = lines[startLineNum..endLineNum]
                            //Filter out comments
                                    .findAll { !it.startsWith("#") }
                            //Drop first empty entry pseudo-column
                                    .collect { it.split('\\|').drop(1).collect { it.trim() } }

                            def columnId = line.substring(0, params.position.character).count("|") - 1
                            def rowId = lineNumber - startLineNum
                            def range = new Range(params.position, new Position(params.position.line, line.indexOf('|', params.position.character) - 1))

                            def completions = cucumber.suggestionProviderResolver.resolveSuggestionsForDataTable(dataTable.datatableSuggestionProvider, precedingLine, rowId, columnId, dataLines)
                            suggestions.addAll(completions.collect {
                                if (it.text == null) {
                                    Main.LOG.warning("Completion item with label ${it.label} has empty text and will be ignored!");
                                    return null
                                }
                                def completionItem = new CompletionItem(it.label ?: it.text)
                                completionItem.kind = CompletionItemKind.Constant
                                completionItem.textEdit = Either.forLeft(new TextEdit(range, it.text))
                                completionItem
                            }.findAll {it})
                            break
                        }
                    }
                } else if (precedingLine.trim().isEmpty()) {
                    break
                }
            }
        } else {
            suggestions.addAll(provideCucumberKeywords())
        }

        def defaults = new CompletionItemDefaults()
        defaults.insertTextFormat = InsertTextFormat.Snippet

        def completionList = new CompletionList(false, suggestions, defaults)
        return CompletableFuture.completedFuture(Either.forRight(completionList))
    }

    List<CompletionItem> provideCucumberKeywords() {
        KEYWORDS.collect {
            def completionItem = new CompletionItem(it)

            completionItem.documentation = Either.forLeft("Cucumber keyword")
            completionItem.kind = CompletionItemKind.Keyword

            return completionItem
        }
    }

    List<CompletionItem> provideStepDefinitions(String line) {
        def definitions = cucumber.glue.stepDefinitions

        return definitions.collect {
            def pattern = it.toSnippetPattern()
            //Remove $0 from the snippet
            def completionItem = new CompletionItem(pattern.split('\n')[0][0..-3])
            completionItem.insertText = pattern
            completionItem.insertTextFormat = InsertTextFormat.Snippet
            completionItem.kind = CompletionItemKind.Method
            completionItem.documentation = Either.forLeft(it.docs)
            completionItem.detail = it.docs ?: null
            completionItem.command = new Command("Add metadata", "cucumber.addMetadata", [new StepDefinitionMetadata(it, line)])
            return completionItem
        }
    }

    List<CompletionItem> provideArgumentSuggestions(String step, int position, FileSystem.DocumentMetadata[] metadata) {
        def argumentProvider = metadata.find {
            it.type == "ArgumentProvider"
        }

        if (argumentProvider) {
            def suggestions = cucumber.suggestionProviderResolver.resolveSuggestions(step, argumentProvider.data)
            return wrapSuggestionsToCompletions(suggestions, CompletionItemKind.Constant)
        }

        return []
    }

    private static List<CompletionItem> wrapSuggestionsToCompletions(List<SuggestionItem> suggestionItems, CompletionItemKind kind) {
        return suggestionItems.collect {
            def completionItem = new CompletionItem(it.label ?: it.text)
            completionItem.kind = kind
            completionItem.insertText = it.text
            completionItem
        }
    }
}
