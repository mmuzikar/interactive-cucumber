package io.github.mmuzikar.interactive.cucumber.agent.data

import java.lang.reflect.Method

interface StepDefinition {
    Method getMethod()

    String toSnippetPattern()

    String getPattern()

    String getLocation()

    Argument[] getArgs()

    String getDocs()

    String[] getTags()

    boolean matches(String s)

    boolean hasDatatable()
}
