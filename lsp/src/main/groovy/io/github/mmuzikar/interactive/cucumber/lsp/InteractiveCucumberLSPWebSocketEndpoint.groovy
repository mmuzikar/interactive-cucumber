package io.github.mmuzikar.interactive.cucumber.lsp

import org.eclipse.lsp4j.jsonrpc.Launcher
import org.eclipse.lsp4j.services.LanguageClient
import org.eclipse.lsp4j.services.LanguageClientAware
import org.eclipse.lsp4j.websocket.jakarta.WebSocketEndpoint

import io.github.mmuzikar.interactive.cucumber.agent.CucumberInterceptor
import io.github.mmuzikar.interactive.cucumber.lsp.storage.RemoteFSEndpoint
import jakarta.websocket.CloseReason
import jakarta.websocket.Session

class InteractiveCucumberLSPWebSocketEndpoint extends WebSocketEndpoint<LanguageClient> {
    @Override
    protected void configure(Launcher.Builder<LanguageClient> builder) {
        builder.setLocalService(new InteractiveCucumberLanguageServer(CucumberInterceptor.cucumber))
        builder.setRemoteInterface(LanguageClient)
    }

    @Override
    protected void connect(Collection<Object> localServices, LanguageClient remoteProxy) {
        localServices
                .each {
                    (it as LanguageClientAware)?.connect(remoteProxy)
                }
    }
}
