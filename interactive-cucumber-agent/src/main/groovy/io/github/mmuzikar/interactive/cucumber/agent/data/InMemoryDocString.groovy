package io.github.mmuzikar.interactive.cucumber.agent.data

import io.cucumber.core.gherkin.DocStringArgument

class InMemoryDocString implements DocStringArgument{

    String text

    InMemoryDocString(String text){
        this.text = text.replace("\"\"\"", "").trim()
    }

    String getContent() {
        return text
    }

    String getContentType() {
        return "text"
    }

    String getMediaType() {
        return "text"
    }

    int getLine() {
        return 0
    }
}
