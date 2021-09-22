package com.github.mmuzikar.interactive.cucumber.agent.handlers

import com.sun.net.httpserver.HttpExchange
import groovy.json.JsonSlurper
import org.apache.commons.io.FileUtils

import java.nio.charset.Charset

class SaveHandler implements Handler {

    static final def OVERRIDE_PROPERTY = "icucumber.features.dir"
    static final def RESOURCE_FOLDER = "src/test/resources/"

    @Override
    void handle(HttpExchange exchange) throws IOException {

        def body = getRequestBody(exchange)
        def request = new JsonSlurper().parseText(body)

        def file = new File(RESOURCE_FOLDER + request.uri)
        if (file.exists()) {
            mergeExisting(file, request.scenarioName, request.content)
        } else {
            FileUtils.write(file, request.content, Charset.defaultCharset())
        }

        println("wrote ${file.getAbsolutePath()}")
        sendResponse(exchange, "")
    }

    /*
    TODO: if a feature file exists we need to do the following:
    read the file and see if there's a scenario with the same name
        if such scenario exists determine its range and replace the body
        else add new scenario to the file
     */

    static void mergeExisting(File file, String scenario, String body) {
        def sourceLines = file.readLines()
        def startLine = sourceLines.findIndexOf { it.contains("Scenario: ${scenario}") }
        if (startLine < 0) {
            startLine = sourceLines.size()
        }
        def endLine = sourceLines.findIndexOf(startLine + 1) {
            it.matches("\\s*Scenario:.*")
        }
        if (endLine < 0) {
            endLine = sourceLines.size()
        }
        def newSource = []
        newSource.addAll(sourceLines.subList(0, startLine))
        newSource.addAll(body.readLines())
        newSource.addAll(sourceLines.subList(endLine, sourceLines.size()))
        file.write(newSource.join("\n"))
    }
}
