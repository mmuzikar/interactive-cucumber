package io.github.mmuzikar.interactive.cucumber.api.datatable;

import org.apache.commons.lang3.reflect.FieldUtils;
import org.apache.commons.lang3.stream.IntStreams;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider;
import io.github.mmuzikar.interactive.cucumber.api.Suggestion;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver;

public interface DatatableSuggestionProvider {

    /**
     * Used for setting up the initial datatable
     *
     * @return a list of rows made up of columns
     */
    default List<List<String>> getInitTemplate() {
        var columns = typesForColumns();
        var list = new ArrayList<List<String>>();
        if (includeHeaderRow()) {
            final List<String> names = Arrays.stream(columns).map(ColumnMetadata::getName).collect(Collectors.toList());
            list.add(names);
            list.add(names.stream().map(s -> " ".repeat(s.length())).collect(Collectors.toList()));
        } else {
            list.add(Collections.nCopies(columns.length, " "));
        }
        return list;
    }

    default boolean includeHeaderRow() {
        return true;
    }

    ColumnMetadata[] typesForColumns();

    default List<SuggestionItem> forCell(String step, int rowId, int columnId, List<List<String>> table, SuggestionProviderResolver resolver) {
        var columns = typesForColumns();
        if (columns != null && columns.length > 0) {
            var column = columns[columnId];
            if (column.suggestionProvider != null) {
                return resolver.resolveSuggestions(step, column.suggestionProvider.getName());
            } else if (column.type != null && resolver.hasSuggestionProviderForType(column.type)) {
                var type = resolver.resolveSuggestionProviderForType(column.type);
                return resolver.resolveSuggestions(step, type.getName());
            }
        }
        return List.of();
    }

    default List<String> getRow(int rowId, List<List<String>> table) {
        return table.get(rowId);
    }

    default List<String> getColumn(int columnId, List<List<String>> table) {
        return table.stream().map(it -> it.get(columnId)).collect(Collectors.toList());
    }

    class SimpleListDatatableSuggestionProvider implements DatatableSuggestionProvider {
        private final Class<?> type;

        public SimpleListDatatableSuggestionProvider(Class<?> type) {
            this.type = type;
        }

        @Override
        public boolean includeHeaderRow() {
            return false;
        }

        @Override
        public ColumnMetadata[] typesForColumns() {
            return new ColumnMetadata[] {new ColumnMetadata(type, null)};
        }
    }

    class ListOfBeansDatatableSuggestionProvider implements DatatableSuggestionProvider {
        private final ColumnMetadata[] columns;

        public ListOfBeansDatatableSuggestionProvider(Class<?> type) {
            this.columns =
                FieldUtils.getAllFieldsList(type).stream().map(f -> {
                    final Suggestion suggestion = f.getAnnotation(Suggestion.class);
                    if (suggestion != null) {
                        return new ColumnMetadata(f.getType(), suggestion.value(), f.getName());
                    }
                    return new ColumnMetadata(f.getType(), f.getName());
                }).toArray(ColumnMetadata[]::new);
        }

        public ListOfBeansDatatableSuggestionProvider(String[] names, Class<?>[] types, Class<? extends SuggestionProvider>[] providers) {
            assert names.length == types.length;
            columns = new ColumnMetadata[names.length];

            for (int i = 0; i < columns.length; i++) {
                columns[i] = new ColumnMetadata(types[i], providers[i], names[i]);
            }
        }

        @Override
        public ColumnMetadata[] typesForColumns() {
            return columns;
        }
    }

    class TemplateDatatableSuggestionProvider implements DatatableSuggestionProvider {

        private final List<List<String>> template;

        public TemplateDatatableSuggestionProvider(List<List<String>> template) {
            this.template = template;
        }

        public TemplateDatatableSuggestionProvider(int width, int height) {
            template = IntStreams.range(height).mapToObj(h -> IntStreams.range(width).mapToObj(it -> " ").collect(Collectors.toList()))
                .collect(Collectors.toList());
        }

        @Override
        public List<List<String>> getInitTemplate() {
            return template;
        }

        @Override
        public ColumnMetadata[] typesForColumns() {
            return new ColumnMetadata[0];
        }
    }

    class ColumnMetadata {
        public final Class<?> type;
        public final Class<? extends SuggestionProvider> suggestionProvider;
        public final String name;

        public ColumnMetadata(Class<?> type, String name) {
            this.type = type;
            this.name = name;
            this.suggestionProvider = null;
        }

        public ColumnMetadata(Class<?> type, Class<? extends SuggestionProvider> suggestionProvider, String name) {
            this.type = type;
            this.suggestionProvider = suggestionProvider;
            this.name = name;
        }

        public Class<?> getType() {
            return type;
        }

        public String getName() {
            return name;
        }

        public Class<? extends SuggestionProvider> getSuggestionProvider() {
            return suggestionProvider;
        }
    }
}
