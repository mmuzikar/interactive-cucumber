package mmuzikar;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.mmuzikar.interactive.cucumber.api.DataSuggestion;
import com.github.mmuzikar.interactive.cucumber.api.ISuggestionProvider;

import io.cucumber.java.DefaultDataTableCellTransformer;
import io.cucumber.java.DefaultDataTableEntryTransformer;
import io.cucumber.java.DefaultParameterTransformer;

import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.List;

public class ParameterTypes {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @DataSuggestion(SampleProvider.class)
    @DefaultParameterTransformer
    @DefaultDataTableEntryTransformer
    @DefaultDataTableCellTransformer
    public Object transformer(Object fromValue, Type toValueType) {
        return objectMapper.convertValue(fromValue, objectMapper.constructType(toValueType));
    }

    public static final class SampleProvider implements ISuggestionProvider {
        @Override
        public List<Object> provide(String step) {
            return Arrays.asList("Hello world");
        }
    }

}
