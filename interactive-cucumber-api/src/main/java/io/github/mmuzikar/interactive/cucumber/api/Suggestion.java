package io.github.mmuzikar.interactive.cucumber.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Used for registering suggestions providers for step arguments.
 *
 * Usage:
 * <code>
 * public class ButtonSuggestionProvider implements SuggestionProvider {
 *
 *     public List<SuggestionItem> provide(String step) {
 *          return ui.findElements("button");
 *     }
 * }
 *
 * \@Given("click on button {string}")
 * public void clickOnButton(@Suggestion(ButtonSuggestionProvider.class) String text) {
 *     ...
 * }
 *
 * </code>
 */
@Target(value = {ElementType.PARAMETER, ElementType.METHOD, ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Suggestion {
    Class<? extends SuggestionProvider> value();
}
