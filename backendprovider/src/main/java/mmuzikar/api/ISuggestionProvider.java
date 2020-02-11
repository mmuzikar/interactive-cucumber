package mmuzikar.api;

import java.util.List;

public interface ISuggestionProvider {

    List<Object> provide(String step, Object[] params);
    default List<Object> provide(String step, Object[] params, int arg){
        return provide(step, params);
    }

}
