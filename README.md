# Interactive testing code contents

See your tests' results as you're writing them. A REPL for your Cucumber BDD tests.

Making your testsuite interactive is as easy as adding a `-javaagent:...` to your test execution configuration.


# Requirements
For running the test suite JDK version 8 and maven are required. Other than that maven should fetch all of its dependencies. As for the UI part npm needs to be installed and `npm install` should suffice. 

## Contents
* agent-groovy - the code responsible for customizing testsuites 
* tests - integration tests
* interactive-cucumber-ui - console for writing your tests

# What's more to come?
This project is still in early stages, following features are planned and hopefully soon to come:
* maven-plugin? - There's no convenient way to automatically get the agent JAR and configure it.
* scripting - for debugging your debugging needs you'll be able to interface with the testing code and try why is this pesky method failing all the time.
* adding / changing step definitions - change your mistakes while you can see what's failing and use the correct stepdef later


## Starting the application
First you'll need to `mvn install` the repository. Use `mvn install -Pstandalone` if you want to build the UI and bundle it to the agent.
Then you can go to `tests/cucumber-6.2.2/` and run `mvn verify`, if everything goes right you should see
```
...
Registered 32 steps
Registered path /liststeps @ com.github.mmuzikar.handlers.ListSteps
Registered path /suggestion @ com.github.mmuzikar.handlers.SuggestionHandler
Registered path /runstep @ com.github.mmuzikar.handlers.RunStepHandler
Registered path /log @ com.github.mmuzikar.handlers.LogHandler
Registered path /typeregistry @ com.github.mmuzikar.handlers.TypeRegistryHandler
Registered path /feature @ com.github.mmuzikar.handlers.FeatureHandler
Registered path /doc @ com.github.mmuzikar.handlers.DocHandler
Registered path / @ com.github.mmuzikar.handlers.UiHandler
Registered path /save @ com.github.mmuzikar.handlers.SaveHandler
Server is open http://localhost:28319
```
Open [http://localhost:28319](http://localhost:28319). 
Type your steps into the editor on the left, press Ctrl+Enter and see your steps executed.
You can also see the steps defined on the right and see the existing features in the other tab.

