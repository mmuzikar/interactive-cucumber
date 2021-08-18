package com.github.interactive.cucumber;

import java.util.List;

public interface ISuggestionProvider {

    List<Object> provide(String step);
}
