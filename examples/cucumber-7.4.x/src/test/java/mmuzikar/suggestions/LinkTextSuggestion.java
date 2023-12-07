package mmuzikar.suggestions;

import static com.codeborne.selenide.Selenide.$$;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import java.util.List;
import java.util.stream.Collectors;

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider;

//Provides suggestions for every link text on the page
public class LinkTextSuggestion implements SuggestionProvider {

    @Override
    public List<SuggestionItem> provide(String step) {
        return $$(By.tagName("a")).stream().map(el -> new SuggestionItem(el.text())).collect(Collectors.toList());
    }
}
