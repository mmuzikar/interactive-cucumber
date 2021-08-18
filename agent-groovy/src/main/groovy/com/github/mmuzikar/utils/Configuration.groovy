package com.github.mmuzikar.utils

class Configuration {

    private static final String CUCUMBER_VERSION = "cucumber.version";
    private static final String PORT = "expose.port";

    private static final Map<String, String> VALUES = [:];

    public static void readConfig(String config) {
        String[] args = config.split(",");

        for (String arg : args){
            String[] keyValue = arg.split("=");
            VALUES.put(keyValue[0], keyValue[1]);
        }
    }

//    public static Version getCucumberVersion() {
//        if (!VALUES.containsKey(CUCUMBER_VERSION)){
//            throw new IllegalStateException("Please supply Cucumber version in the java agent");
//        }
//        return Version.parse(VALUES.get(CUCUMBER_VERSION));
//    }

    public static int getExposedPort() {
        return Integer.parseInt(VALUES.getOrDefault(PORT, "28319"));
    }


}
