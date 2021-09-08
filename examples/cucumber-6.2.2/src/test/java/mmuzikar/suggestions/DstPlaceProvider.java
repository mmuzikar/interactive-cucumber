package mmuzikar.suggestions;

import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.By;
import com.github.interactive.cucumber.ISuggestionProvider;

import java.util.List;
import java.util.stream.Collectors;

import static com.codeborne.selenide.Selenide.$;

public class DstPlaceProvider implements ISuggestionProvider {

    public List<Object> provide(String step) {
        return $(By.cssSelector("select[name=\"toPort\"]")).$$("option").stream().map(SelenideElement::innerText).collect(Collectors.toList());
    }

}
