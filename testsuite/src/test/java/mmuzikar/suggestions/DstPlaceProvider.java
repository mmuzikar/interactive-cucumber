package mmuzikar.suggestions;

import com.codeborne.selenide.SelenideElement;
import mmuzikar.api.ISuggestionProvider;
import mmuzikar.api.SimpleSuggestionProvider;
import org.openqa.selenium.By;

import java.util.List;
import java.util.stream.Collectors;

import static com.codeborne.selenide.Selenide.$;

public class DstPlaceProvider extends SimpleSuggestionProvider {

    @Override
    public List<Object> provide(String step) {
        return $(By.cssSelector("select[name=\"toPort\"]")).$$("option").stream().map(SelenideElement::innerText).collect(Collectors.toList());
    }

    @Override
    public List<Object> provide(String step, int arg) {
        return provide(step);
    }
}
