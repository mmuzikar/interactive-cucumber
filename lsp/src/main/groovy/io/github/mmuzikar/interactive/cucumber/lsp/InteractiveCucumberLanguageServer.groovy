package io.github.mmuzikar.interactive.cucumber.lsp

import org.eclipse.lsp4j.CompletionOptions
import org.eclipse.lsp4j.InitializeParams
import org.eclipse.lsp4j.InitializeResult
import org.eclipse.lsp4j.ServerCapabilities
import org.eclipse.lsp4j.SetTraceParams
import org.eclipse.lsp4j.TextDocumentSyncKind
import org.eclipse.lsp4j.services.LanguageClient
import org.eclipse.lsp4j.services.LanguageClientAware
import org.eclipse.lsp4j.services.TextDocumentService
import org.eclipse.lsp4j.services.WorkspaceService

import java.util.concurrent.CompletableFuture

import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber
import io.github.mmuzikar.interactive.cucumber.lsp.handlers.LogHandler
import io.github.mmuzikar.interactive.cucumber.lsp.storage.RemoteFSEndpoint
import io.github.mmuzikar.interactive.cucumber.lsp.storage.RemoteFSEndpointImpl
import io.github.mmuzikar.interactive.cucumber.lsp.websocket.WebSocketRunner

class InteractiveCucumberLanguageServer implements MyLanguageServer, LanguageClientAware {

    private InteractiveCucumberServices cucumberServices
    private Cucumber cucumber
    private LogHandler logHandler
    private RemoteFSEndpoint remoteFSEndpoint

    InteractiveCucumberLanguageServer(Cucumber cucumber) {
        this.cucumber = cucumber
        cucumberServices = new InteractiveCucumberServices(cucumber)
        remoteFSEndpoint = new RemoteFSEndpointImpl()
    }

    void startServer() {
        try {
            WebSocketRunner runner = new WebSocketRunner()
            runner.run()
        } catch (Throwable t) {
            t.printStackTrace()
        }
    }

    @Override
    void connect(LanguageClient languageClient) {
        cucumberServices.connect(languageClient)
        this.logHandler = new LogHandler(languageClient)
    }

    @Override
    CompletableFuture<InitializeResult> initialize(InitializeParams initializeParams) {
        println("Initialize!")
        ServerCapabilities serverCapabilities = new ServerCapabilities()

        serverCapabilities.setCompletionProvider(new CompletionOptions(true, [".", ","]))
        serverCapabilities.setTextDocumentSync(TextDocumentSyncKind.Full)
        serverCapabilities.setHoverProvider(true)

        return CompletableFuture.completedFuture(new InitializeResult(serverCapabilities))
    }

    @Override
    CompletableFuture<Object> shutdown() {
        logHandler.close()
        return CompletableFuture.completedFuture(new Object())
    }

    @Override
    void exit() {
        System.exit(0)
    }

    @Override
    TextDocumentService getTextDocumentService() {
        return cucumberServices
    }

    @Override
    WorkspaceService getWorkspaceService() {
        return cucumberServices
    }

    @Override
    void setTrace(SetTraceParams params) {
    }

    @Override
    RemoteFSEndpoint getRemoteFSEndpoint() {
        return remoteFSEndpoint
    }
}
