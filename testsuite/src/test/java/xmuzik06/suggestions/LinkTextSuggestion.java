package xmuzik06.suggestions;

import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.By;
import xmuzik06.handlers.ISuggestionProvider;

import java.util.List;
import java.util.stream.Collectors;

import static com.codeborne.selenide.Selenide.$$;

public class LinkTextSuggestion implements ISuggestionProvider {

    @Override
    public List<Object> provide(String step, Object[] params) {
        return $$(By.tagName("a")).stream().map(SelenideElement::text).collect(Collectors.toList());
    }
}
