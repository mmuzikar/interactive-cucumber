package io.github.mmuzikar.interactive.cucumber.agent.data.impl

import com.github.therapi.runtimejavadoc.RuntimeJavadoc

import java.lang.reflect.Method
import java.util.regex.Pattern

import io.cucumber.datatable.DataTable
import io.github.mmuzikar.interactive.cucumber.agent.data.Argument
import io.github.mmuzikar.interactive.cucumber.agent.data.StepDefinition
import io.github.mmuzikar.interactive.cucumber.agent.data.TypeRegistry
import io.github.mmuzikar.interactive.cucumber.agent.utils.LineNumUtils
import io.github.mmuzikar.interactive.cucumber.agent.utils.PatternToSnippetConverter
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver
import io.github.mmuzikar.interactive.cucumber.api.Tag

class StepDefinitionImpl implements StepDefinition {

	String pattern;
	transient Method method;
	transient def origObject;

	String location;

    Argument[] args;

	String docs

	String[] tags

	StepDefinitionImpl(origObject, SuggestionProviderResolver resolver) {
		this.origObject = origObject;
		readPattern(origObject)
		this.method = origObject.method;
		loadArgs(resolver);
		loadDocs()
		resolveLocation()
		loadTags()
	}

	private void readPattern(origObject) {
		def pattern = origObject.expression;
		if (pattern instanceof Pattern) {
			this.pattern = pattern.pattern();
		} else {
			this.pattern = pattern;
		}
	}

	private void loadDocs() {
		def javadoc = RuntimeJavadoc.getJavadoc(origObject.method)
		if (!javadoc.isEmpty()) {
			this.docs = javadoc.comment.toString()
		}
	}

	private void loadArgs(SuggestionProviderResolver resolver) {
		if (method) {
			args = new Argument[method.parameterCount];
			for (i in 0..<method.parameterCount) {
				args[i] = new Argument(method.parameters[i], resolver);
			}
		}
	}

	private void resolveLocation() {
		def lineNums = LineNumUtils.getLineNumberForMethods(method.getDeclaringClass())
		location = method.declaringClass.getName() + "#" + method.getName() + ":" + lineNums[method.getName()]
	}

	private boolean isRegexPattern() {
		pattern instanceof Pattern || (pattern.startsWith("^") && pattern.endsWith('$'))
	}

	String toSnippetPattern() {
		def snippet = isRegexPattern() ?
			PatternToSnippetConverter.snippetFromRegex(pattern) :
			PatternToSnippetConverter.snippetFromGherkin(pattern)

		def groupCount = snippet.findAll(/\$\{?[1-9]+/).size()


		if (groupCount != args.size() && args.size() > 0) {
			def lastArg = args.last()
			if (lastArg.datatableSuggestionProvider) {
				def template = lastArg.datatableSuggestionProvider.getInitTemplate()
				snippet += '\n' + template.collect {
					'| ' + it.join(" | ") + ' |'
				}.join('\n')
			} else if (lastArg.type == String.class.name) {
				snippet += '\n"""\n$' + groupCount + 1 + '\n"""'
			} else {
				snippet += '\n| | |'
			}
		}

		return snippet
	}

	@Override
	boolean matches(String s) {
		if (isRegexPattern()) {
			s.matches(pattern)
		} else {
			throw new UnsupportedOperationException()
		}
	}

	@Override
	boolean hasDatatable() {
		def last =  args.last()
		return [DataTable.class.name, List.class.name].contains(last.type)
	}

	private void loadTags() {
		def tags = []
		def classTags = method.getDeclaringClass().getDeclaredAnnotationsByType(Tag)
		if (classTags) {
			tags.addAll(classTags.collect {
				it.value()
			})
		}
		def methodTags = method.getDeclaredAnnotationsByType(Tag)
		if (methodTags) {
			tags.addAll(methodTags.collect {
				it.value()
			})
		}
		this.tags = tags.flatten().toUnique().toArray()
	}
}

