package com.github.mmuzikar.interactive.cucumber.agent.data

import com.github.mmuzikar.interactive.cucumber.agent.utils.LineNumUtils
import com.github.mmuzikar.interactive.cucumber.api.Tag
import com.github.therapi.runtimejavadoc.RuntimeJavadoc

import java.lang.reflect.Method
import java.util.regex.Pattern

class StepDef implements GroovyObject {

	String pattern;

	transient Method method;
	transient def origObject;

	String location;

	Argument[] args;

	String docs

	String[] tags

	StepDef(origObject) {
		this.origObject = origObject;
		readPattern(origObject)
		this.method = origObject.method;
		loadArgs();
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

	private void loadArgs() {
		if (method) {
			args = new Argument[method.parameterCount];
			for (i in 0..<method.parameterCount) {
				args[i] = new Argument(method.parameters[i]);
			}
		}
	}

	void execute(Object... params) {
	}

	void resolveLocation() {
		def lineNums = LineNumUtils.getLineNumberForMethods(method.getDeclaringClass())
		location = method.declaringClass.getName() + "#" + method.getName() + ":" + lineNums[method.getName()]
	}

	void loadTags() {
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
