package mmuzikar.suggestions;

import com.codeborne.selenide.SelenideElement;
import com.github.mmuzikar.interactive.cucumber.api.ISuggestionProvider;

import org.openqa.selenium.By;

import java.util.List;
import java.util.stream.Collectors;

import static com.codeborne.selenide.Selenide.$$;

//Provides suggestions for every link text on the page
public class LinkTextSuggestion implements ISuggestionProvider {

    @Override
    public List<Object> provide(String step) {
        return $$(By.tagName("a")).stream().map(SelenideElement::text).collect(Collectors.toList());
    }
}
