Feature: Simple travel agency tests

    @sta-buy
    Scenario: Buying random ticket
        When user is on the blaze-demo page
        And selects departure city "Boston"
        And selects destination city "Cairo"
        And searches for flights

        Then there should be 5 flights
        When user selects the 2. flight
        And clicks on the "Purchase Flight" button
        Then the ticket should be purchased
