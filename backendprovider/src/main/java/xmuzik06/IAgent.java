package xmuzik06;

import java.lang.instrument.Instrumentation;

public interface IAgent {

    default void handleArguments(String args) {/*NOOP*/}
    void registerTransformations(Instrumentation instrumentation);


}
