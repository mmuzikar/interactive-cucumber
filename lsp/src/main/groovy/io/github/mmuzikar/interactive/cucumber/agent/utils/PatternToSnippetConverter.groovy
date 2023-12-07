package io.github.mmuzikar.interactive.cucumber.agent.utils

import java.util.regex.Pattern


class PatternToSnippetConverter {

    static final String GHERKIN_VAR = ~/\{[^}]*}/
    static final String REGEX_CAPTURE_GROUP = ~/(?<!\\)\([^)]*\)/

    static String snippetFromRegex(Pattern regex) {
        snippetFromRegex(regex.pattern())
    }

    static String snippetFromRegex(String regex) {
        if (regex.startsWith("^")) {
            regex = regex.substring(1)
        }
        if (regex.endsWith('$')) {
            regex = regex.substring(0, regex.length() - 1)
        }

        def snippetId = 1
        return regex.replaceAll(REGEX_CAPTURE_GROUP, {
            return "\$${snippetId++}"
        }) + '$0'
    }

    static String snippetFromGherkin(String pattern) {
        def snippetId = 1
        return pattern.replaceAll(GHERKIN_VAR, { String it ->
            def snippet = "\${${snippetId++}:${it.substring(1, it.length() - 1)}}"
            if (it == "{string}") {
                snippet = '"' + snippet + '"'
            }
            return snippet
        }) + '$0'
    }

    static String removePatterns(String pattern) {
        pattern.replaceAll(~/\$((\d+)|(\{\d+:\w+}))/, '')
    }

}
