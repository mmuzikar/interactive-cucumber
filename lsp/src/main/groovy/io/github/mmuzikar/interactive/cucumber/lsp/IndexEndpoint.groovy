package io.github.mmuzikar.interactive.cucumber.lsp

import org.glassfish.grizzly.http.server.Request
import org.glassfish.grizzly.http.server.Response
import org.glassfish.grizzly.http.server.StaticHttpHandlerBase
import org.glassfish.grizzly.http.util.HttpStatus

import jakarta.websocket.Endpoint
import jakarta.websocket.EndpointConfig
import jakarta.websocket.Session
import jakarta.ws.rs.Produces

class IndexEndpoint extends StaticHttpHandlerBase {

    @Override
    protected boolean handle(String uri, Request request, Response response) throws Exception {
        response.setStatus(HttpStatus.OK_200)
        response.createOutputStream().newPrintWriter().println("Hello world");
        response.flush()
        return true
    }

}
