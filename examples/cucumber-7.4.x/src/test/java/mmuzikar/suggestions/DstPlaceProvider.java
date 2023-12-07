package mmuzikar.suggestions;

import static com.codeborne.selenide.Selenide.$;

import org.openqa.selenium.By;

import com.codeborne.selenide.SelenideElement;

import java.util.List;
import java.util.stream.Collectors;

import io.github.mmuzikar.interactive.cucumber.api.SuggestionItem;
import io.github.mmuzikar.interactive.cucumber.api.SuggestionProvider;

public class DstPlaceProvider implements SuggestionProvider {

    public List<SuggestionItem> provide(String step) {
        return $(By.cssSelector("select[name=\"toPort\"]")).$$("option").stream().map(SelenideElement::innerText).map(SuggestionItem::withText)
            .collect(Collectors.toList());
    }
}
