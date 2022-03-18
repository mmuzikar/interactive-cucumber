Feature: Agent exposes basic Cucumber functionality
  
  Background: Testsuite is running 
    Given running testsuite
  
  Scenario: Step registry is exposed
    Then check 31 steps are registered
    And check "I add {int} and {int}" step has arguments
      | int |
      | int |

  Scenario: DataTable and docstrings are handled correctly
    Then check "submit docstring" step has arguments
      | java.lang.String |
    Then check "submit datatable" step has arguments
      | io.cucumber.datatable.DataTable |

  Scenario: Log is being captured
    Then verify response from "/log" contains
    """
    Server is open
    """

  Scenario: Features are exposed
    Then verify response from "/feature" contains
    """
    mmuzikar/features/calculator.feature
    """
    Then verify response from "/feature" contains
    """
    mmuzikar/features/dates.feature
    """
    Then verify response from "/feature" contains
    """
    Examples: Single digits
    """
    Then verify response from "/feature" contains
    """
    Scenario: Buying random ticket
    """

  Scenario: Steps are executable
    Then run step "a calculator I just turned on" via REST

  Scenario: Missing steps won't crash the whole testsuite
    Then verify running wrong step won't crash the app