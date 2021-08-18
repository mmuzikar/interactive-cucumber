package com.github.mmuzikar.data

import com.github.interactive.cucumber.Suggestion

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
