# Interactive testing 

See your tests' results as you're writing them. A REPL for your JUnit Cucumber BDD tests.

No additional code required, just add a dependency and configure your test runner and you're ready to go.

## Requirements
Currently tested configration is Cucumber 6.2.2 + JUnit 4.13. More configurations coming in the future.

## Setup
Add following dependency to your project: 
```
<dependency>
    <groupId>com.github.mmuzikar</groupId>
    <artifactId>interactive-cucumber-agent</artifactId>
    <version>[version]</version>
</dependency>
```
And configure your runner to run on a specific profile, eg.
```
<plugin>
    <artifactId>maven-(surefire|failsafe)-plugin</artifactId>
    <version>2.22.2</version>
    <configuration>
        <argLine>-javaagent:${settings.localRepository}/com/github/mmuzikar/interactive-cucumber-agent/[version]/interactive-cucumber-agent-[version].jar</argLine>
    </configuration>
</plugin>
```

## Contents
* interactive-cucumber-agent - the code responsible for customizing testsuites 
* tests - integration tests, currently only for the generated REST endpoint
* interactive-cucumber-ui - UI for writing your tests
* examples - example and an example testsuite to be tested by tests

## Starting the application
First you'll need to `mvn install` the repository. Use `mvn install -Pstandalone` if you want to build the UI and bundle it to the agent.
Then you can go to `tests/cucumber-6.2.2/` and run `mvn verify`, if everything goes right you should see
```
...
Registered 32 steps
Registered path /liststeps @ com.github.mmuzikar.interactive.cucumber.agent.handlers.ListSteps
Registered path /suggestion @ com.github.mmuzikar.interactive.cucumber.agent.handlers.SuggestionHandler
Registered path /runstep @ com.github.mmuzikar.interactive.cucumber.agent.handlers.RunStepHandler
Registered path /log @ com.github.mmuzikar.interactive.cucumber.agent.handlers.LogHandler
Registered path /typeregistry @ com.github.mmuzikar.interactive.cucumber.agent.handlers.TypeRegistryHandler
Registered path /feature @ com.github.mmuzikar.interactive.cucumber.agent.handlers.FeatureHandler
Registered path /doc @ com.github.mmuzikar.interactive.cucumber.agent.handlers.DocHandler
Registered path / @ com.github.mmuzikar.interactive.cucumber.agent.handlers.UiHandler
Registered path /save @ com.github.mmuzikar.interactive.cucumber.agent.handlers.SaveHandler
Server is open http://localhost:28319
```
Open [http://localhost:28319](http://localhost:28319). 
Type your steps into the editor on the left, press Ctrl+Enter and see your steps executed.
You can also see the steps defined on the right and see the existing features in the other tab.

## Missing features / TODO
There are many planned features or cut corners for a fully satisfying user experience. Consider this current version as a prototype. 
Please report any issues or features you'd like to see, but didn't see mentioned anywhere. 

See (current roadmap)[roadmap.md] for planned features and feel free to contribute!