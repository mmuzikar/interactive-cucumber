package mmuzikar.api;

import java.util.List;

public interface ISuggestionProvider {

    List<Object> provide(String step);
    default List<Object> provide(String step, int arg){
        return provide(step);
    }

}
