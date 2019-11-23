package xmuzik06;

import java.lang.instrument.Instrumentation;

public class AgentMain {

    public static void premain(String args, Instrumentation instrumentation){
        IAgent agent;
        agent = new ByteBuddyHandler();
        agent.handleArguments(args);
        agent.registerTransformations(instrumentation);
    }

}
