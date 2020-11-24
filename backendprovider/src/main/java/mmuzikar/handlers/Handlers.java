package mmuzikar.handlers;

import lombok.Getter;

/**
 * Public handlers to provide resources to the ui
 */
public enum Handlers {

    RUN_STEP(new RunStepHandler()),
    LIST_STEPS(new ListStepsHandler()),
    SUGGEST(new SuggestionHandler()),
    LOG(new LogHandler());

    @Getter
    Handler handler;

    Handlers(Handler handler){
        this.handler = handler;
    }


}
