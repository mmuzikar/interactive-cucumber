package mmuzikar;

import com.codeborne.selenide.Selenide;
import com.github.mmuzikar.interactive.cucumber.api.Suggestion;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import mmuzikar.suggestions.DeparturePlaceProvider;
import mmuzikar.suggestions.DstPlaceProvider;
import mmuzikar.suggestions.InputSuggestion;
import mmuzikar.suggestions.LinkTextSuggestion;

import org.junit.Assert;
import org.openqa.selenium.By;

import java.util.Map;

import static com.codeborne.selenide.Selenide.$;
import static org.junit.Assert.assertEquals;

//Classes with step definitions
public class Stepdefs {

    @When("^open browser on \"([^\"]*)\"$")
    public void openBrowser(String page) {
        Selenide.open(page);
    }

    @When("^user is on the \"([^\"]*)\" page$")
    public void openPage(String page) {
        Selenide.open("https://blazedemo.com/");
    }

    @When("^selects departure city \"([^\"]*)\"$")
    public void setDep(@Suggestion(DeparturePlaceProvider.class) String value) {
        $(By.cssSelector("select[name=\"fromPort\"]")).selectOption(value);
    }

    @When("^selects destination city \"([^\"]*)\"$")
    public void setDst(@Suggestion(DstPlaceProvider.class) String value) {
        $(By.cssSelector("select[name=\"toPort\"]")).selectOption(value);
    }

    @When("^searches for flights$")
    public void search() {
        $(By.cssSelector("input[type=\"submit\"]")).click();
    }

    @Then("^there should be ([0-9]+) flights$")
    public void checkFlightNum(int count) {
        assertEquals($(By.cssSelector("table.table tbody")).$$(By.tagName("tr")).size(), count);
    }

    @When("^user selects the ([0-9]+). flight$")
    public void clickOnFlight(int num) {
        $(By.cssSelector("table.table tbody")).$$(By.tagName("tr")).get(num - 1).$(By.cssSelector("input")).click();
    }

    /**
     * Clicks on button with the text value of the parameter
     *
     * @param text
     */
    @When("^clicks on the \"([^\"]*)\" button$")
    public void clickOnButton(String text) {
        $(By.cssSelector("input[value=\"" + text + "\"]")).click();
    }

    /**
     * Asserts that the website displayed thank you message
     */
    @Then("^the ticket should be purchased$")
    public void validate() {
        assertEquals($(By.cssSelector("h1")).text(), "Thank you for your purchase today!");
    }

    @When("^set input \"([^\"]*)\" value \"([^\"]*)\"$")
    public void setInputValue(@Suggestion(InputSuggestion.class) String selector, String value) {
        $(selector).setValue(value);
    }

    @When("^input \"([^\"]*)\" has value \"([^\"]*)\"$")
    public void verifyInputValue(@Suggestion(InputSuggestion.class) String selector, String value) {
        Assert.assertEquals($(selector).getValue(), value);
    }

    @When("^click on link \"([^\"]*)\"$")
    public void clickOnLink(@Suggestion(LinkTextSuggestion.class) String linkText) {
        $(By.linkText(linkText)).click();
    }

    @When("fill form named {string}")
    public void tableUsage(String str, DataTable table) {
        Map<String, String> formData = table.asMap(String.class, String.class);
        formData.forEach((key, value) -> $(By.id(str)).$(By.name(key)).setValue(value));
    }

    @When("^switch to images$")
    public void switchToImages() throws Exception {
        throw new Exception("This has failed on purpose, tell me if you noticed this :)");
    }

    @When("^submit search$")
    public void submit() {
        $(By.cssSelector(".Tg7LZd")).click();
    }

    @When("submit docstring")
    public void docString(String text) {
        System.out.println("Received docstring: " + text);
    }

    @When("submit datatable")
    public void datatable(DataTable table) {
        table.asLists().forEach(System.out::println);
    }
}