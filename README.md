# Interactive testing code contents
As you can read in the thesis this application is made of 3 components Agent, Test suite and Frontend. These respective components are placed in their respective folders:
 * backendprovider - *agent*
 * testsuite - *test suite*
 * ui - *frontend*

# Requirements
For running the test suite JDK version 8 and maven are required. Other than that maven should fetch all of its dependencies. As for the UI part npm needs to be installed and `npm install` should suffice. 


## Starting the application
Running the application requires running the test suite which is modified by the agent and opening the UI in the browser.
### Development version
The test suite is started by running command `mvn clean install` in the root directory which compiles the agent and starts the test suite using the agent. If changes are made to the code of either test suite or agent run `mvn clean test` again to compile and restart the backend.

For running the development version of the Frontend change directory to the `ui` folder and run `npm start` (`npm install` might be needed to fetch the dependencies first). Changes to the code should be recompiled and the browser window should refresh when the compilation is done. If creating a release build (making a portable version without development dependencies) `npm build` will produce a `dist` folder where the compiled files can be found. 

### Bundled version
The test suite backend still needs to be run by running `mvn clean install` in the root directory.

The built version of the fronted can be found in directory `frontend` where the `index.html` file can be just opened in a browser.
