package mmuzikar;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(plugin = {"pretty"})
//runner class
public class RunCucumberTest {

    @BeforeClass
    public static void before(){
        int a = 2 + 4;
    }

}