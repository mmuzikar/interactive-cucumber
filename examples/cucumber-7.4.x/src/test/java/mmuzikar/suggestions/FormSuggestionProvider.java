package mmuzikar.suggestions;

import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProviderResolver;
import io.github.mmuzikar.interactive.cucumber.api.datatable.DatatableSuggestionProvider;

public class FormSuggestionProvider implements DatatableSuggestionProvider {

    private static final Pattern STEP_PATTERN = Pattern.compile("fill form named \"([^\"]*)\"");

    @Override
    public ColumnMetadata[] typesForColumns() {
        return new ColumnMetadata[] {
            new ColumnMetadata(String.class, LabelSuggestionProvider.class, "label"),
            new ColumnMetadata(String.class, "value")
        };
    }

    @Override
    public List<SuggestionItem> forCell(String step, int rowId, int columnId, List<List<String>> table, SuggestionProviderResolver resolver) {
        if (getColumn(columnId, table).get(0).equals("value")) {
            var row = getRow(rowId, table);
            var label = row.get(0);
            if (!label.isEmpty()) {
                if (label.equals("creditCardType")) {
                    label = "cardType";
                }
                final SelenideElement inputEl = $(By.name(label));
                if (inputEl.exists()) {
                    if (inputEl.getTagName().equals("select")) {
                        return resolver.resolveSuggestionProvider(SelectValuesProvider.class).provide(inputEl);
                    } else if (inputEl.attr("type").equals("checkbox") || inputEl.attr("type").equals("radio")) {
                        return List.of(SuggestionItem.withText("true"), SuggestionItem.withText("false"));
                    } else {
                        return List.of();
                    }
                }
            }
        }
        return DatatableSuggestionProvider.super.forCell(step, rowId, columnId, table, resolver);
    }

    static String getFormName(String step) {
        final Matcher matcher = STEP_PATTERN.matcher(step);
        if (matcher.matches()) {
            return matcher.group(1);
        }
        return null;
    }

    public static class LabelSuggestionProvider implements SuggestionProvider {

        @Override
        public List<SuggestionItem> provide(String step) {
            String formName = getFormName(step);
            By formSelector = formName != null ? By.id(formName) : By.tagName("form");
            if ($(formSelector).exists()) {
                return $(formSelector).$$(By.tagName("label")).stream().map(el -> new SuggestionItem(el.text(), el.attr("for")))
                    .collect(Collectors.toList());
            }
            return List.of();
        }
    }
}
