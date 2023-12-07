package mmuzikar.suggestions;

import static com.codeborne.selenide.Selenide.$$;

import org.openqa.selenium.By;

import java.util.List;
import java.util.stream.Collectors;

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider;

//Provides suggestions for all inputs on the page
public class InputSuggestion implements SuggestionProvider {

    @Override
    public List<SuggestionItem> provide(String step) {
        return $$(By.tagName("input")).stream().map(element -> new SuggestionItem(element.getAttribute("name"), element.getText()))
            .collect(Collectors.toList());
    }
}
