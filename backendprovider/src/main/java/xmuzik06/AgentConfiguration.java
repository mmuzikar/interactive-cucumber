package xmuzik06;

public class AgentConfiguration {

    private static final String BACKEND_PORT_TCP = "backend.port.tcp";
    private static final String BACKEND_PORT_UDP = "backend.port.udp";


    public static int getUsedTCPPort(){
        return (int) System.getProperties().getOrDefault(BACKEND_PORT_TCP, 28319);
    }

    public static int getUsedUDPPort(){
        return (int) System.getProperties().getOrDefault(BACKEND_PORT_UDP, getUsedTCPPort() + 1);
    }

}
