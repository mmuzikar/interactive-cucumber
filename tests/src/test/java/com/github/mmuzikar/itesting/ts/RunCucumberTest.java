package com.github.mmuzikar.itesting.ts;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import io.restassured.RestAssured;

import org.junit.BeforeClass;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(plugin = {"pretty"})
public class RunCucumberTest {

    @BeforeClass
    public static void setUp() {
        RestAssured.baseURI = "http://localhost:28319";
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

}
