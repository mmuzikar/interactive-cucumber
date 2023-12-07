package io.github.mmuzikar.itesting.ts.app;

import static org.assertj.core.api.Assertions.assertThat;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;

public class TestSuiteSteps {

    public static TestSuite testsuite;

    @Given("running testsuite with version {string}")
    public void runTestsuite(String version) {
        testsuite = new TestSuite(version);
        testsuite.restart();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                testsuite.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }));
    }

    @Then("testsuite log contain")
    public void logsContain(String pattern) {
        assertThat(testsuite.getLogs()).containsPattern(pattern);
    }


}
