package io.github.mmuzikar.interactive.cucumber.agent.data.impl

import io.cucumber.core.gherkin.DataTableArgument

class InMemoryDatatable implements DataTableArgument {

    List<List<String>> cells

    InMemoryDatatable(String text) {
        cells = text.split("\n").collect({it.split("\\|")*.trim()})*.drop(1)
    }

    List<List<String>> cells() {
        return cells
    }

    int getLine() {
        return 0
    }
}
