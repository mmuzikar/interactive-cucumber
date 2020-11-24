package mmuzikar.utils;

import com.google.gson.*;

import java.lang.reflect.Type;
import java.util.regex.Pattern;

public class PatternSerializer implements JsonSerializer<Pattern> {
    @Override
    public JsonElement serialize(Pattern pattern, Type type, JsonSerializationContext jsonSerializationContext) {
        return jsonSerializationContext.serialize(pattern.toString());
    }
}
