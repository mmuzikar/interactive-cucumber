package mmuzikar.suggestions;

import org.openqa.selenium.By;

import java.util.List;
import java.util.stream.Collectors;

import com.github.mmuzikar.interactive.cucumber.api.ISuggestionProvider;

import static com.codeborne.selenide.Selenide.$$;

//Provides suggestions for all inputs on the page
public class InputSuggestion implements ISuggestionProvider {

    @Override
    public List<Object> provide(String step) {
        return $$(By.tagName("input")).stream().map(element -> String.format("%s:%s", element.getAttribute("name"), element.getText())).collect(Collectors.toList());
    }
}
