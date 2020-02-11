package mmuzikar.processors;

import java.util.HashMap;
import java.util.Set;

public enum ExposeProcessor {
    INSTANCE;

    HashMap<String, Object> objects = new HashMap<>();

    public void registerObject(String id, Object obj){
        objects.putIfAbsent(id, obj);
    }

    public boolean isDefined(String id){
        return objects.containsKey(id);
    }

    public Set<String> getRegisteredObjects(){
        return objects.keySet();
    }

}
