# Roadmap

First let's define areas that would benefit with some more love put into them
* frontend code - frontend code is by complete beginner, so it can be messy
* frontend look - the app is currently a prototype and functionality is more important than looks ATM
* suggestions & datatypes - datatypes could be a great benefit of shared suggestion providers, docs, etc...
* scenario outlines - this *scenario* is currently not implemented, a little more thought needs to be put into how to implement
* Java magic - ideally you should be able to modify and experiment with your Java code in the tool
* code structure - some things are used on both backend and frontend, data types are not shared, etc
* testsuite - currently there are some checks for the java-agent functionality, but some tests for the UI would help out a lot
* breakpoints - if users are debugging long scenarios it would be helpful to stop execution at some point to inspect what's wrong

## Now what's the priority?
### Suggestions & datatypes
Providing suggestions while the tested app is running is one of the greatest benefit of interactive testing. 
Datatypes can be a great way to share common suggestions and help with maintaining the code base.

This also includes showing the documenatation for the arguments and the step definition user is currently typing in the editor.

### Scenario outlines 
This is quite a common practice to have in Cucumber testsuites, so it's kinda embarrasing not supporting it.
The current proposal is to allow users to select which Examples they want and be able to switch and re-run on the fly. 
There should be an easy way to add new examples and quickly test out the runs. The variables need to be properly highlighted and ideally present some example values.

### Testsuite 
With constant changes it's needed to maintain everything working. Also it's a good way of dogfooding to use interactive testing to make interactive testing testsuite.

### Java magic
Big in effort, but big in pay off. For the Java interop to work as intended following requirements must be met:
* being able to write java in the same editor, without any clicking or modifications, switching to different IDEs
* adding step definitions, modifying step defintions
* the testsuite being able to restart / cleanup, if user wants to change something they need to make sure no dangling values are left there after changes
* proper IDE-like experience, suggestions, seeing the source, etc.
* debugging and inspecting values shoud be easy, who cares about visibility modifiers? 