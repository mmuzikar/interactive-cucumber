package xmuzik06.handlers;

import lombok.Getter;

public enum Handlers {

    RUN_STEP(new RunStepHandler()),
    LIST_STEPS(new ListStepsHandler()),
    ADD_STEP(new AddStepHandler()),
    SUGGEST(new SuggestionHandler());

    @Getter
    Handler handler;

    Handlers(Handler handler){
        this.handler = handler;
    }


}
