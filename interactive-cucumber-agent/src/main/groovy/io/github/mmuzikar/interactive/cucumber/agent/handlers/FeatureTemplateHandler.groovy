package io.github.mmuzikar.interactive.cucumber.agent.handlers

import com.sun.net.httpserver.HttpExchange

import io.github.mmuzikar.interactive.cucumber.agent.data.Cucumber

class FeatureTemplateHandler implements Handler {

    static final String TEMPLATE = """# Here's where the magic happens
Feature: My awesome feature
    Scenario: The easiest scenario I've ever written
        When I type stuff
        Then stuff happens right in front of my eyes!
"""

    @Override
    void handle(HttpExchange exchange) throws IOException {
        def template = Cucumber.getResource("/interactive-cucumber.template.feature")
        template = template ? template.getText() : TEMPLATE

        sendResponse(exchange, template)
    }
}
