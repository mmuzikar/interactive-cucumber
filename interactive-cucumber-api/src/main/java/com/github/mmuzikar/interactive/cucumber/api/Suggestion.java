package com.github.mmuzikar.interactive.cucumber.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Used for registering suggestions providers for step arguments.
 *
 * Usage:
 * <code>
 * public class ButtonSuggestionProvider implements ISuggestionProvider {
 *
 *     public List<Object> provide(String step) {
 *          return ui.findElements("button");
 *     }
 * }
 *
 * \@Given("click on button {string}")
 * public void clickOnButton(@Suggestion() String text) {
 *     ...
 * }
 *
 * </code>
 */
@Target(value = ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface Suggestion {
    Class<? extends ISuggestionProvider> value();
}
