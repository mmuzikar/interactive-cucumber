package mmuzikar.data;

import lombok.Getter;
import lombok.Setter;

/**
 * An arguemnt for step definition registered for this application
 * contains suggProvider field which contains the classname of registered suggestion provider
 */
public class CucumberArg {
        public CucumberArg (String type){
            this.type = type;
        }

        @Getter
        private final String type;
        @Getter
        @Setter
        private String suggProvider = "";
}
