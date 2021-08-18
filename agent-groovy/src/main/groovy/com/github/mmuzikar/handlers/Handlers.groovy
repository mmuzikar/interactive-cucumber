package com.github.mmuzikar.handlers

enum Handlers implements GroovyObject {
    LIST_STEPS(new ListSteps()),
    SUGGESTIONS(new SuggestionHandler()),
    RUN_STEP(new RunStepHandler()),
    LOG(new LogHandler()),
    TYPE_REGISTRY(new TypeRegistryHandler()),
    FEATURES(new FeatureHandler()),
    DOCS(new DocHandler()),
    UI(new UiHandler()),
    SAVE(new SaveHandler())

    Handler handler;

    Handlers(Handler handler) {
        this.handler = handler;
    }

}