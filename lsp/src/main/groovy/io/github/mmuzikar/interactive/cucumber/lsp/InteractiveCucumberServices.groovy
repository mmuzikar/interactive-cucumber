package io.github.mmuzikar.interactive.cucumber.lsp

import org.eclipse.lsp4j.CompletionItem
import org.eclipse.lsp4j.CompletionList
import org.eclipse.lsp4j.CompletionParams
import org.eclipse.lsp4j.CreateFilesParams
import org.eclipse.lsp4j.DidChangeConfigurationParams
import org.eclipse.lsp4j.DidChangeTextDocumentParams
import org.eclipse.lsp4j.DidChangeWatchedFilesParams
import org.eclipse.lsp4j.DidCloseTextDocumentParams
import org.eclipse.lsp4j.DidOpenTextDocumentParams
import org.eclipse.lsp4j.DidSaveTextDocumentParams
import org.eclipse.lsp4j.Hover
import org.eclipse.lsp4j.HoverParams
import org.eclipse.lsp4j.MarkupContent
import org.eclipse.lsp4j.jsonrpc.messages.Either
import org.eclipse.lsp4j.jsonrpc.services.JsonDelegate
import org.eclipse.lsp4j.jsonrpc.services.JsonNotification
import org.eclipse.lsp4j.jsonrpc.services.JsonRequest
import org.eclipse.lsp4j.services.LanguageClient
import org.eclipse.lsp4j.services.LanguageClientAware
import org.eclipse.lsp4j.services.TextDocumentService
import org.eclipse.lsp4j.services.WorkspaceService

import com.google.gson.JsonObject

import java.util.concurrent.CompletableFuture

import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.agent.data.FeatureData
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.lsp.completion.CucumberCompletionProvider
import io.github.mmuzikar.interactive.cucumber.lsp.storage.FileSystem

class InteractiveCucumberServices implements TextDocumentService, WorkspaceService, LanguageClientAware {

    private LanguageClient languageClient
    private Cucumber cucumber

    FileSystem fs = new FileSystem()

    CucumberCompletionProvider completionProvider

    InteractiveCucumberServices(Cucumber cucumber) {
        this.cucumber = cucumber
    }

    @Override
    void connect(LanguageClient languageClient) {
        this.languageClient = languageClient
        completionProvider = new CucumberCompletionProvider(cucumber, languageClient, fs)
    }

    @Override
    void didOpen(DidOpenTextDocumentParams didOpenTextDocumentParams) {
        fs.updateDocument(didOpenTextDocumentParams.textDocument.uri, didOpenTextDocumentParams.textDocument.text)
    }

    @Override
    void didCreateFiles(CreateFilesParams params) {
        params.files.each {
            fs.updateDocument(it.uri, '')
        }
    }

    @Override
    void didChange(DidChangeTextDocumentParams didChangeTextDocumentParams) {
        fs.updateDocument(didChangeTextDocumentParams.textDocument.uri, didChangeTextDocumentParams.contentChanges.first().text)
    }

    @Override
    void didClose(DidCloseTextDocumentParams didCloseTextDocumentParams) {
    }

    @Override
    void didSave(DidSaveTextDocumentParams didSaveTextDocumentParams) {
    }

    @Override
    void didChangeConfiguration(DidChangeConfigurationParams didChangeConfigurationParams) {
    }

    @Override
    void didChangeWatchedFiles(DidChangeWatchedFilesParams didChangeWatchedFilesParams) {
    }

    @Override
    CompletableFuture<Hover> hover(HoverParams params) {
        def uri = params.textDocument.uri
        def position = params.position

        def metadata = fs.getMetadata(uri, position)
        def stepDefMetadata = metadata.find {
            it.type == "StepDefinition"
        }

        if (stepDefMetadata) {
            def stepDefinition = cucumber.glue.stepDefinitions.find {
                it.pattern == stepDefMetadata.data
            }
            return CompletableFuture.completedFuture(new Hover(new MarkupContent('plaintext', stepDefinition.docs ?: '')))
        }

        return CompletableFuture.completedFuture(null)
    }

    @Override
    CompletableFuture<Either<List<CompletionItem>, CompletionList>> completion(CompletionParams params) {
        def line = fs.getLine(params.textDocument.uri, params.position)
        return completionProvider.provide(line, params)
    }



    @Override
    CompletableFuture<CompletionItem> resolveCompletionItem(CompletionItem unresolved) {
        return CompletableFuture.completedFuture(unresolved)
    }

    @JsonRequest(value="cucumber/runStep")
    CompletableFuture<String> runStep(JsonObject request) {
        def result = cucumber.runStep(request.get('step').getAsString())
        def stackTraceWriter = new StringWriter()
        def writer = new PrintWriter(stackTraceWriter)
        result?.printStackTrace(writer)
        result?.printStackTrace()
        return CompletableFuture.completedFuture(result ? stackTraceWriter.toString() : null)
    }

    @JsonNotification(value = "cucumber/documentMetadata")
    void documentMetadata(JsonObject notification) {
        def uri = notification.get("uri").getAsString()
        def argumentProviders = notification.get("argumentProviderRanges").getAsJsonArray()
        def knownStepDefinitions = notification.get("knownStepDefinitions").getAsJsonArray()
        def metadata = []
        metadata.addAll(argumentProviders.collect {
            new FileSystem.DocumentMetadata(it.getAsJsonObject())
        })
        metadata.addAll(knownStepDefinitions.collect {
            new FileSystem.DocumentMetadata(it.getAsJsonObject())
        })

        fs.updateMetadata(uri, metadata)
    }

    @JsonRequest(value = "cucumber/getStepDefinitions")
    CompletableFuture<List<StepDefinition>> getStepDefinitions() {
        return CompletableFuture.completedFuture(cucumber.glue.stepDefinitions)
    }

    @JsonRequest(value = "cucumber/getFeatures")
    CompletableFuture<List<FeatureData>> getFeatures() {
        return CompletableFuture.completedFuture(cucumber.features.collect {
            new FeatureData(it)
        })
    }

}
