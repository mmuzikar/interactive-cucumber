package mmuzikar.suggestions;

import com.codeborne.selenide.SelenideElement;
import io.github.mmuzikar.interactive.cucumber.api.ISuggestionProvider;

import org.openqa.selenium.By;

import java.util.List;
import java.util.stream.Collectors;

import static com.codeborne.selenide.Selenide.$;

public class DeparturePlaceProvider implements ISuggestionProvider {

    @Override
    public List<Object> provide(String step) {
        return $(By.cssSelector("select[name=\"fromPort\"]")).$$("option").stream().map(SelenideElement::innerText).collect(Collectors.toList());
    }
}
