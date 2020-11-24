package mmuzikar.datamapping;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;

@FunctionalInterface
public interface Mapper<S, T> {

    Map<Class<? extends Mapper>, Mapper<?, ?>> mappers = new HashMap<>();

    static <S, T> T convert(Class<? extends Mapper> clazz, S obj) {
        if (mappers.get(clazz) == null) {
            try {
                Constructor<? extends Mapper> constructor = clazz.getDeclaredConstructor();
                constructor.setAccessible(true);
                mappers.put(clazz, constructor.newInstance());
            } catch (InstantiationException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
                e.printStackTrace();
            }
        }
        return ((Mapper<S, T>) mappers.get(clazz)).convert(obj);
    }

    T convert(S o);
}

class DefaultMapper implements Mapper<Object, Object> {

    @Override
    public Object convert(Object o) {
        return o;
    }
}

