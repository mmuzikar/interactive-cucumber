package mmuzikar;

import java.lang.instrument.Instrumentation;

public class AgentMain {

    //Agent entry-point
    public static void premain(String args, Instrumentation instrumentation) {
        ByteBuddyHandler agent = new ByteBuddyHandler();
        agent.handleArguments(args);
        agent.registerTransformations(instrumentation);
    }

}
