package xmuzik06;

import com.codeborne.selenide.Selenide;
import cucumber.api.java.en.When;
import cucumber.api.junit.Cucumber;
import lombok.extern.java.Log;
import org.junit.Assert;
import org.junit.runners.model.InitializationError;
import org.openqa.selenium.By;
import xmuzik06.annotations.Suggestion;
import xmuzik06.suggestions.InputSuggestion;
import xmuzik06.suggestions.LinkTextSuggestion;

import java.io.IOException;

import static com.codeborne.selenide.Selenide.$;

@Log
public class Stepdefs {

    @When("open browser on \"([^\"]*)\"")
    @Suggestion(InputSuggestion.class)
    public void openBrowser(String page) {
        TestObject testObject = new TestObject();
        log.info("TestClient object: " + testObject.toString());
        Selenide.open(page);
    }

    @When("set input \"([^\"]*)\" value \"([^\"]*)\"")
    public void setInputValue(@Suggestion(InputSuggestion.class) String selector, String value) {
        $(selector).setValue(value);
    }

    @When("input \"([^\"]*)\" has value \"([^\"]*)\"")
    public void verifyInputValue(@Suggestion(InputSuggestion.class) String selector, String value){
        Assert.assertEquals($(selector).getValue(), value);
    }

    @When("click on link \"([^\"]*)\"")
    public void clickOnLink(@Suggestion(LinkTextSuggestion.class) String linkText){
        $(By.linkText(linkText)).click();
    }
}