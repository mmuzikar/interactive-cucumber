package io.github.mmuzikar.interactive.cucumber.api;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExposeManager {

    private static final List<Runnable> listeners = new ArrayList<>();

    private static final Map<String, Object> exposedValues = new HashMap<>();

    public static void expose(Object value) {
        exposedValues.put(value.getClass().getSimpleName().toLowerCase(), value);
        notifyListeners();
    }

    public static void expose(String name, Object value) {
        exposedValues.put(name, value);
        notifyListeners();
    }

    public static void removeObject(String name) {
        exposedValues.remove(name);
        notifyListeners();
    }

    public static void removeObject(Object value) {
        exposedValues.entrySet().stream().filter(entry -> entry.getValue().equals(value)).findAny().ifPresent(entry -> exposedValues.remove(entry.getKey()));
        notifyListeners();
    }

    public static void listenForChanges(Runnable r) {
        listeners.add(r);
    }

    private static void notifyListeners() {
        listeners.forEach(Runnable::run);
    }

    public static Map<String, Object> getExposedValues() {
        return exposedValues;
    }

    public static <T> T getVariable(String name) {
        return (T) exposedValues.get(name);
    }

}
