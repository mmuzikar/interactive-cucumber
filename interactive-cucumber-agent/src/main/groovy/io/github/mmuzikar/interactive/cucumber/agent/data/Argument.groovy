package io.github.mmuzikar.interactive.cucumber.agent.data

import io.github.mmuzikar.interactive.cucumber.api.Suggestion

import java.lang.reflect.Parameter

class Argument {

    String type;
    String suggProvider = "";

    Argument(Parameter parameter){
        type = parameter.getType().getName();

        Suggestion sugg = parameter.getAnnotation(Suggestion);
        if (sugg){
            suggProvider = sugg.value().getName();
        }
    }

}
