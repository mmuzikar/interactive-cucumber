package io.github.mmuzikar.interactive.cucumber.lsp

import org.glassfish.tyrus.core.ServerEndpointConfigWrapper

import jakarta.websocket.Endpoint
import jakarta.websocket.server.ServerApplicationConfig
import jakarta.websocket.server.ServerEndpointConfig

class InteractiveCucumberLSPConfig implements ServerApplicationConfig {
    @Override
    Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> set) {
        return [ServerEndpointConfig.Builder.create(InteractiveCucumberLSPWebSocketEndpoint, "/interactive-cucumber-server").build(),
                ServerEndpointConfig.Builder.create(JavaLSPWebSocketEndpoint, "/java").build()]
    }

    @Override
    Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> set) {
        return set
    }
}
