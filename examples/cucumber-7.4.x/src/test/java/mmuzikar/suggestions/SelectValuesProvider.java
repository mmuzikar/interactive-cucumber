package mmuzikar.suggestions;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import java.util.List;
import java.util.stream.Collectors;

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider;

public class SelectValuesProvider implements SuggestionProvider {
    @Override
    public List<SuggestionItem> provide(String step) {
        return null;
    }

    public List<SuggestionItem> provide(SelenideElement element) {
        return element.$$(By.tagName("option")).stream().map(el -> new SuggestionItem(el.getText())).collect(Collectors.toList());
    }
}
