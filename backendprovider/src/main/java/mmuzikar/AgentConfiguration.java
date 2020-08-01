package mmuzikar;

//Configuration class
public class AgentConfiguration {

    private static final String BACKEND_PORT_TCP = "backend.port.tcp";
    private static final String BACKEND_PORT_UDP = "backend.port.udp";

    //used for the http server
    public static int getUsedTCPPort(){
        return (int) System.getProperties().getOrDefault(BACKEND_PORT_TCP, 28319);
    }

    //UDP port is not used
    public static int getUsedUDPPort(){
        return (int) System.getProperties().getOrDefault(BACKEND_PORT_UDP, getUsedTCPPort() + 1);
    }

}
