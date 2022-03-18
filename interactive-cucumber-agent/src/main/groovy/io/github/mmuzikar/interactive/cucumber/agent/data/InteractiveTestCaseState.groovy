package io.github.mmuzikar.interactive.cucumber.agent.data

import io.cucumber.core.backend.Status
import io.cucumber.core.backend.TestCaseState

class InteractiveTestCaseState implements TestCaseState{

    Collection<String> getSourceTagNames() {
        return ["When", "Then", "Given", "And", "Or"]
    }

    Status getStatus() {
        return Status.PASSED
    }

    boolean isFailed() {
        return false
    }

    void attach(byte[] data, String mediaType, String name) {

    }

    void attach(String data, String mediaType, String name) {

    }

    void log(String text) {
        println text
    }

    String getName() {
        return ""
    }

    String getId() {
        return "unique id"
    }

    URI getUri() {
        return URI.create("inmemory")
    }

    Integer getLine() {
        return 1
    }
}
