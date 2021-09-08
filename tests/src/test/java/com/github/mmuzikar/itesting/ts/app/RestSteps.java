package com.github.mmuzikar.itesting.ts.app;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Assertions;

import org.awaitility.Awaitility;
import org.hamcrest.Matchers;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;

public class RestSteps {

    @Then("check {int} steps are registered")
    public void numStepsAreRegistered(int val) {
        RestAssured.get("/liststeps").then().body("$", Matchers.hasSize(val));
    }

    @Then("check {string} step has properties")
    public void checkStepProps(String stepPattern, DataTable properties) {
        JSONObject step = fetchStepDef(stepPattern);
        if (step == null) {
            Assertions.fail("Failed to find step with pattern " + stepPattern);
        }

        properties.cells().forEach(row -> {
            assertThat(step.get(row.get(0))).isEqualTo(row.get(1));
        });
    }

    @Then("check {string} step has arguments")
    public void checkStepArgs(String stepPattern, DataTable properties) {
        JSONObject step = fetchStepDef(stepPattern);
        if (step == null) {
            Assertions.fail("Failed to find step with pattern " + stepPattern);
        }

        final JSONArray args = step.getJSONArray("args");
        assertThat(args).isNotNull();
        for (int i = 0; i < properties.height(); i++) {
            final List<String> row = properties.row(i);
            final JSONObject arg = args.getJSONObject(i);
            assertThat(arg.getString("type")).isEqualTo(row.get(0));
            if (row.size() > 1) {
                assertThat(arg.getString("suggProvider")).isEqualTo(row.get(1));
            }
        }
    }

    @Then("verify response from {string} contains")
    public void assertLogsEndpoint(String endpoint, String value) {
        Awaitility.await().untilAsserted(() -> RestAssured.get(endpoint).then().body(Matchers.containsString(value)));
    }

    @When("run step {string} via REST")
    public void executeStep(String step) {
        RestAssured.given().body(step).post("/runstep").then().statusCode(200);
    }

    @Then("verify running wrong step won't crash the app")
    public void stepRunWontCrashTheApp() {
        RestAssured.given().body("This step doesn't exist").post("/runstep").then().statusCode(500);
        assertThat(TestSuiteSteps.testsuite.isRunning()).isTrue();
    }

    private JSONObject fetchStepDef(String step) {
        final String jsonSrc = RestAssured.get("/liststeps").thenReturn().getBody().print();
        JSONArray steps = new JSONArray(jsonSrc);
        for (int i = 0; i < steps.length(); i++) {
            if (steps.getJSONObject(i).getString("pattern").equalsIgnoreCase(step)) {
                return steps.getJSONObject(i);
            }
        }
        return null;
    }
}
