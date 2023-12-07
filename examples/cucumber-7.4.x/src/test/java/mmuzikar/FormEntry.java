package mmuzikar;

import io.cucumber.java.DataTableType;
import io.cucumber.java.ParameterType;

public class FormEntry {
    
    private final String label;
    private final String value;

    public FormEntry(String label, String value) {
        this.label = label;
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public String getValue() {
        return value;
    }
}
