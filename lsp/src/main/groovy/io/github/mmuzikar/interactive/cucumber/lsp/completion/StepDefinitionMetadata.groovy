package io.github.mmuzikar.interactive.cucumber.lsp.completion

import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.Range

import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition

class StepDefinitionMetadata {

    String pattern
    static class ArgumentProviderMetadata {
        Range range
        String provider

        ArgumentProviderMetadata(Range range, String provider) {
            this.range = range
            this.provider = provider
        }
    }
    List<ArgumentProviderMetadata> argumentProviderMetadata

    StepDefinitionMetadata(StepDefinition stepDef, String line) {
        this.pattern = stepDef.pattern

        if (stepDef.args.any {
            it.suggProvider
        }) {
            argumentProviderMetadata = []
            stepDef.args.eachWithIndex { argument, int i ->
                if (argument.suggProvider) {
                    def matcher = stepDef.toSnippetPattern() =~ /(\$${i + 1})|(\$\{${i + 1}[^}]*})/
                    if (matcher) {
                        def metadata = new ArgumentProviderMetadata(new Range(new Position(0, matcher.start(0) + line.size()), new Position(0, matcher.end(0) - 1 + line.size())), argument.suggProvider)
                        argumentProviderMetadata.push(metadata)
                    }
                }
            }
        }
    }

}
