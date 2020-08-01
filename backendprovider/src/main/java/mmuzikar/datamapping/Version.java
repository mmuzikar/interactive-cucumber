package mmuzikar.datamapping;

import java.util.Arrays;

public class Version {
    private final int[] versions;

    public Version(int major, int minor, int patch) {
        versions = new int[]{major, minor, patch};
    }

    public Version(int major, int minor) {
        versions = new int[]{major, minor, -1};
    }

    public Version(int major) {
        versions = new int[]{major, -1, -1};
    }

    public boolean matches(Version v){
        return match(this, v);
    }

    public static boolean match(Version v1, Version v2) {
        for (int i = 0; i < 3; i++) {
            if (v1.versions[i] != v2.versions[i]) {
                if ((v1.versions[i] == -1) || (v2.versions[i] == -1)) {
                    continue;
                }
                return false;
            }
        }
        return true;
    }

    private static int getVersionPart(String s){
        try {
            return Integer.parseInt(s);
        } catch (Exception e){
            return -1;
        }
    }

    public static Version parse(String from){
        String[] parts = from.split("\\.");
        if (parts.length == 1){
            return new Version(getVersionPart(parts[0]));
        } else if (parts.length == 2){
            return new Version(getVersionPart(parts[0]), getVersionPart(parts[1]));
        } else {
            return new Version(getVersionPart(parts[0]), getVersionPart(parts[1]), getVersionPart(parts[2]));
        }

    }
}
