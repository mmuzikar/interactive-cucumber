package io.github.mmuzikar.interactive.cucumber.api;

import java.util.HashMap;
import java.util.Map;

public class ExposeManager {

    private static final Map<String, Object> exposedValues = new HashMap<>();

    public static void expose(Object value) {
        exposedValues.put(value.getClass().getSimpleName().toLowerCase(), value);
    }

    public static void expose(String name, Object value) {
        exposedValues.put(name, value);
    }

    public static void removeObject(String name) {
        exposedValues.remove(name);
    }

    public static void removeObject(Object value) {
    }

    public static Map<String, Object> getExposedValues() {
        return exposedValues;
    }

}
