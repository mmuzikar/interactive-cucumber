package io.github.mmuzikar.interactive.cucumber.api;

public class SuggestionItem {

    private final String label;
    private final String text;

    public SuggestionItem(String label, String text) {
        this.label = label;
        this.text = text;
    }

    public SuggestionItem(String text) {
        this.text = text;
        this.label = null;
    }

    public String getLabel() {
        return label;
    }

    public String getText() {
        return text;
    }

    public static SuggestionItem withText(String text) {
        return new SuggestionItem(text);
    }

    public static SuggestionItem labeledText(String label, String text) {
        return new SuggestionItem(label, text);
    }
}
