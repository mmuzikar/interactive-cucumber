package mmuzikar.datamapping;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Datatable {


    private static Object createTable(List<List<String>> data) {
        try {
            Class<?> tableClass = Class.forName("io.cucumber.datatable.DataTable");
            Method createMethod = tableClass.getDeclaredMethod("create", List.class);
            return createMethod.invoke(null, data);
        } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static Object parseTable(String tableString) {
        String[] rows = tableString.split("\n");
        List<List<String>> rowsList = new ArrayList<>();
        for (String row : rows) {
            rowsList.add(Arrays.asList(row.replaceFirst("\\|", "").split("\\|")));
        }
        return createTable(rowsList);
    }

    public static boolean isTable(String tableString) {
        return tableString.contains("|") && !tableString.startsWith("\"\"\"");
    }
}
