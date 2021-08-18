package com.github.mmuzikar.data

import com.github.therapi.runtimejavadoc.RuntimeJavadoc

import java.lang.reflect.Method
import java.util.regex.Pattern

class StepDef implements GroovyObject{

    String pattern;

    transient Method method;
    transient def origObject;

    String location;

    Argument[] args;

    String docs


    StepDef(origObject) {
        this.origObject = origObject;
        readPattern(origObject)
        this.method = origObject.method;
        loadArgs();
        loadDocs()
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
}
