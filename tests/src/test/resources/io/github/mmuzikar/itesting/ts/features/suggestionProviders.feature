Feature: Suggestion providers
  
  Background: 
    Given running testsuite with version "7.4.x"

  @rest
  Scenario: Suggestion providers are picked up 
    Then check "^input \"([^\"]*)\" has value \"([^\"]*)\"$" step has arguments
      | java.lang.String | mmuzikar.suggestions.InputSuggestion |