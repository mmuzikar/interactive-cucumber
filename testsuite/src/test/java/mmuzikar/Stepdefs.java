package mmuzikar;

import com.codeborne.selenide.Selenide;
import cucumber.api.DataTable;
import cucumber.api.java.en.When;
import lombok.extern.java.Log;
import mmuzikar.api.Suggestion;
import mmuzikar.suggestions.InputSuggestion;
import mmuzikar.suggestions.LinkTextSuggestion;
import org.junit.Assert;
import org.openqa.selenium.By;

import java.util.Map;

import static com.codeborne.selenide.Selenide.$;

@Log
public class Stepdefs {

    @When("open browser on \"([^\"]*)\"")
    @Suggestion(InputSuggestion.class)
    public void openBrowser(String page) {
        Selenide.open(page);
    }

    @When("set input \"([^\"]*)\" value \"([^\"]*)\"")
    public void setInputValue(@Suggestion(InputSuggestion.class) String selector, String value) {
        $(selector).setValue(value);
    }

    @When("input \"([^\"]*)\" has value \"([^\"]*)\"")
    public void verifyInputValue(@Suggestion(InputSuggestion.class) String selector, String value) {
        Assert.assertEquals($(selector).getValue(), value);
    }

    @When("click on link \"([^\"]*)\"")
    public void clickOnLink(@Suggestion(LinkTextSuggestion.class) String linkText) {
        $(By.linkText(linkText)).click();
    }

    @When("fill form named \"([^\"]*)\"")
    public void tableUsage(String str, DataTable table) {
        Map<String, String> formData = table.asMap(String.class, String.class);
        formData.entrySet().forEach(entry -> {
            $(By.id(str)).$(By.name(entry.getKey())).setValue(entry.getValue());
        });
    }

    @When("switch to images")
    public void switchToImages() throws Exception {
        throw new Exception("This has failed on purpose, tell me if you noticed this :)");
    }

    @When("submit search")
    public void submit(){
        $(By.cssSelector(".Tg7LZd")).click();
    }
}