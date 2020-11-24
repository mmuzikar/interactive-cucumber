package mmuzikar.datamapping;

import lombok.extern.java.Log;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@Log
public class Mappers {
    public static final class StringToPatternMapper implements Mapper<String, Pattern> {

        private static final Map<String, String> toReplace = new HashMap<>();

        static {
            toReplace.put("\\{int\\}", "-?\\d+");
            toReplace.put("\\{float\\}", "-?\\d*.\\d+");
            toReplace.put("\\{word\\}", "\\w+");
            toReplace.put("\\{string\\}", "\"([^\\\"']*)\"");
            toReplace.put("\\{\\}", ".*");
        }

        private static String cucumberToRegex(String cucumber){
            for (Map.Entry<String, String> entry : toReplace.entrySet()){
                cucumber = cucumber.replaceAll(entry.getKey(), entry.getValue());
            }
            return cucumber;
        }

        @Override
        public Pattern convert(String o) {
            try {
                if (o.startsWith("^")){
                    o = o.substring(1);
                }
                if (o.endsWith("$")){
                    o = o.substring(0, o.length()-1);
                }
                return Pattern.compile(o);
            } catch (PatternSyntaxException e) {
                log.info("Cannot process pattern " + o + " setting to empty string");
                return Pattern.compile(cucumberToRegex(o));
            }
        }
    }
}
