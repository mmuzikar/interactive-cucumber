package mmuzikar.data;

import lombok.Getter;
import lombok.Setter;

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
