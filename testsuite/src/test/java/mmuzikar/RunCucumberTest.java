package mmuzikar;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import lombok.extern.java.Log;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(plugin = {"pretty"})
@Log
//runner class
public class RunCucumberTest {

    @BeforeClass
    public static void before(){
        log.info("Setting up the testsuite");
    }

}