package io.github.mmuzikar.interactive.cucumber.agent.data

import io.github.mmuzikar.interactive.cucumber.agent.utils.NoopSuggestionProvider
import io.github.mmuzikar.interactive.cucumber.api.ISuggestionProvider
import io.cucumber.cucumberexpressions.ParameterType
import io.cucumber.docstring.DocStringType

import java.lang.reflect.Type

class TypeRegistry implements GroovyObject {

    def origObject

    ParameterTypeRegistry parameterTypeRegistry
    DocStringTypeRegistry docStringTypeRegistry
    def tableTypeRegistry

    Map<String, Class<? extends ISuggestionProvider>> typeSuggestionProviders = [:]

    TypeRegistry(origObject) {
        this.origObject = origObject

        this.parameterTypeRegistry = new ParameterTypeRegistry(origObject.parameterTypeRegistry)
        this.docStringTypeRegistry = new DocStringTypeRegistry(origObject.docStringTypeRegistry)
        this.tableTypeRegistry = origObject.dataTableTypeRegistry
    }

    def registerSuggestionProviderForType(String typeId, Class<? extends ISuggestionProvider> suggestionProvider) {
        typeSuggestionProviders[typeId] = suggestionProvider
    }

    Class<? extends ISuggestionProvider> getSuggestionsProviderForType(String typeId) {
        return typeSuggestionProviders.getOrDefault(typeId, NoopSuggestionProvider)
    }

    def hasSuggestionProviderForType(String typeId) {
        return typeSuggestionProviders.containsKey(typeId)
    }

    private class ParameterTypeRegistry {

        def origObject

        ParameterTypeRegistry(origObject) {
            this.origObject = origObject
        }

        ParameterType<?> lookupByName(String name) {
            return origObject.lookupByTypeName(name)
        }

        Collection<ParameterType<?>> getParameters() {
            return origObject.getParameterTypes()
        }
    }

    private class DocStringTypeRegistry {
        def origObject

        DocStringTypeRegistry(origObject) {
            this.origObject = origObject
        }

        DocStringType lookupByContentType(String contentType) {
            return origObject.lookupByContentType(contentType);
        }

        DocStringType lookupByType(Type type) {
            return origObject.lookupByType(type)
        }

        Collection<DocStringType> getDocStringTypes() {
            return origObject.docStringTypesByContentType.values()
        }

    }


}
