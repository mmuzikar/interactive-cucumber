package io.github.mmuzikar.interactive.cucumber.lsp

import org.eclipse.lsp4j.jsonrpc.services.JsonDelegate
import org.eclipse.lsp4j.services.LanguageServer

import io.github.mmuzikar.interactive.cucumber.lsp.storage.RemoteFSEndpoint

interface MyLanguageServer extends LanguageServer {

    @JsonDelegate
    RemoteFSEndpoint getRemoteFSEndpoint()

}
