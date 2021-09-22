package com.github.mmuzikar.interactive.cucumber.api;

import java.util.List;

public interface ISuggestionProvider {

    List<Object> provide(String step);
}
