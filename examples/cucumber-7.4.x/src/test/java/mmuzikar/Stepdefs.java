package mmuzikar;

import static org.junit.Assert.assertEquals;

import static com.codeborne.selenide.Selenide.$;

import org.junit.Assert;

import org.openqa.selenium.By;

import com.codeborne.selenide.Selenide;

import java.util.List;
import java.util.Map;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.DataTableType;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.github.mmuzikar.interactive.cucumber.api.ExposeManager;
import io.github.mmuzikar.interactive.cucumber.api.Suggestion;
import io.github.mmuzikar.interactive.cucumber.api.datatable.DatatableSuggestion;
import io.github.mmuzikar.interactive.cucumber.api.datatable.GenericSizeDatatableSuggestionProvider;
import mmuzikar.suggestions.DeparturePlaceProvider;
import mmuzikar.suggestions.DstPlaceProvider;
import mmuzikar.suggestions.FormSuggestionProvider;
import mmuzikar.suggestions.InputSuggestion;
import mmuzikar.suggestions.LinkTextSuggestion;

//Classes with step definitions
public class Stepdefs {

    @When("^open browser on \"([^\"]*)\"$")
    public void openBrowser(String page) {
        Selenide.open(page);
    }

    @When("^user is on the blaze-demo page$")
    public void openPage() {
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
    public void tableUsage(String str, @DatatableSuggestion(FormSuggestionProvider.class) DataTable table) {
        Map<String, String> formData = table.asMap(String.class, String.class);
        formData.forEach((key, value) -> $(By.id(str)).$(By.name(key)).setValue(value));
    }

    @DataTableType
    public FormEntry formEntry(Map<String, String> map) {
        String label = map.get("label");
        if (label.equals("creditCardType")) {
            label = "cardType";
        }
        return new FormEntry(label, map.get("value"));
    }

    @When("fill in the form")
    public void fillInForm(@DatatableSuggestion(FormSuggestionProvider.class) List<FormEntry> formEntries) {
        formEntries.forEach(entry -> {
            var element = $(By.name(entry.getLabel()));
            if (element.getTagName().equals("input")) {
                element.setValue(entry.getValue());
            } else if (element.getTagName().equals("select")) {
                element.selectOption(entry.getValue());
            }
        });
    }

    @When("^throw exception$")
    public void throwException() throws Exception {
        throw new Exception("This has failed on purpose, tell me if you noticed this :)");
    }

    @When("submit docstring")
    public void docString(String text) {
        System.out.println("Received docstring: " + text);
    }

    @When("submit datatable")
    public void datatable(@GenericSizeDatatableSuggestionProvider(width = 2, height = 3) DataTable table) {
        table.asLists().forEach(System.out::println);
    }

    @When("register string variable with name {string} and value {string}")
    public void registerVar(String name, String value) {
        ExposeManager.expose(name, value);
    }
}