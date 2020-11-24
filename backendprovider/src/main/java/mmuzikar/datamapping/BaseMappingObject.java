package mmuzikar.datamapping;

import com.google.common.base.Strings;
import lombok.NoArgsConstructor;
import lombok.extern.java.Log;
import mmuzikar.utils.ReflectionUtils;
import sun.misc.Unsafe;

import java.lang.reflect.*;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static mmuzikar.utils.ReflectionUtils.isInstantiable;

@Log
@NoArgsConstructor
public abstract class BaseMappingObject {

    public static Supplier<Version> versionSupplier = () -> new Version(6, 2, 2);

    public static <T extends BaseMappingObject> T from(Object obj, Class<T> clazz) {
        T thiz;
        try {
            Unsafe unsafe;
            Field f = Unsafe.class.getDeclaredField("theUnsafe");
            f.setAccessible(true);
            unsafe = (Unsafe) f.get(null);
            thiz = (T) unsafe.allocateInstance(clazz);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        Field[] fields = clazz.getDeclaredFields();
        List<Field> annotFields = Arrays.stream(fields).filter(
                field -> field.getAnnotation(Mapping.class) != null ||
                        field.getAnnotation(Mappings.class) != null)
                .collect(Collectors.toList());
        for (Field f : annotFields) {
            map(thiz, f, obj);
        }
        Predicate<Method> shouldCall = (method) -> {
            CallWhenVersion an = method.getAnnotation(CallWhenVersion.class);
            if (an == null) {
                return false;
            } else return Version.parse(an.value()).matches(versionSupplier.get());
        };
        Arrays.stream(clazz.getDeclaredMethods()).filter(shouldCall).collect(Collectors.toList()).forEach(m -> {
            try {
                m.setAccessible(true);
                if ((m.getModifiers() & Modifier.STATIC) != 0) {
                    if (m.getParameterCount() == 0) {
                        m.invoke(clazz);
                    } else {
                        m.invoke(clazz, obj);
                    }
                } else {
                    if (m.getParameterCount() == 0) {
                        m.invoke(thiz);
                    } else {
                        m.invoke(thiz, obj);
                    }
                }
            } catch (IllegalAccessException | InvocationTargetException e) {
                e.printStackTrace();
            }
        });
        return thiz;
    }

    private static void map(Object ret, Field f, Object o) {
        Mappings a = f.getAnnotation(Mappings.class);
        Mapping[] mappings;
        if (a != null) {
            mappings = a.value();
        } else {
            mappings = new Mapping[]{f.getAnnotation(Mapping.class)};
        }
        for (Mapping m : mappings) {
            Version v = Version.parse(m.declaredVersion());
            if (v.matches(versionSupplier.get())) {
                performMapping(ret, f, o, m);
            }
        }
    }

    private static Object convertIfYouCan(Object o, Class<?> clazz) {
        if (BaseMappingObject.class.isAssignableFrom(clazz)) {
            return BaseMappingObject.from(o, (Class<? extends BaseMappingObject>) clazz);
        } else {
            return o;
        }
    }

    private static Object convertIfYouCan(Object o, Type t) {
        try {
            if (t instanceof ParameterizedType) {
                ParameterizedType pt = ((ParameterizedType) t);
                Class<?> clazz = (Class<?>) pt.getRawType();
                if (Map.class.isAssignableFrom(clazz)) {
                    Map<?, ?> map = (Map<?, ?>) o;
                    Map retMap;
                    if (isInstantiable(clazz)) {
                        retMap = (Map) clazz.newInstance();
                    } else {
                        retMap = map.getClass().newInstance();
                    }
                    Type[] paramTypes = pt.getActualTypeArguments();
                    Class<?> keyType = (Class<?>) paramTypes[0];
                    Class<?> valType = (Class<?>) paramTypes[1];
                    map.forEach((o1, o2) -> retMap.put(convertIfYouCan(o1, keyType), convertIfYouCan(o2, valType)));
                    return retMap;
                } else if (Collection.class.isAssignableFrom(clazz)) {
                    Collection<?> col = (Collection<?>) o;
                    Collection retCol;
                    if (isInstantiable(clazz)) {
                        retCol = (Collection<?>) clazz.newInstance();
                    } else {
                        retCol = col.getClass().newInstance();
                    }
                    Type[] paramType = pt.getActualTypeArguments();
                    Class<?> valType = (Class<?>) paramType[0];
                    col.forEach(it -> retCol.add(convertIfYouCan(it, valType)));
                    return retCol;
                }
            } else {
                convertIfYouCan(o, ((Class<?>) t));
            }
        } catch (Exception e){
            e.printStackTrace();
            return null;
        }
        return null;
    }

    private static void performMapping(Object ret, Field f, Object o, Mapping m) {
        try {
            if (!Strings.isNullOrEmpty(m.fieldName())) {
                //Dig using accessors
                String[] path = m.fieldName().split("\\.");
                Object context = o;
                for (String p : path) {
                    if (p.endsWith("()")) {
                        p = p.substring(0, p.length() - 2);
                        context = ReflectionUtils.callOnObject(context, p);
                    } else {
                        context = ReflectionUtils.get(context, p);
                    }
                }
                if (context == null) {
                    return;
                }
                Class<?> fType = f.getType();
                f.setAccessible(true);
                if (Collection.class.isAssignableFrom(fType)) {
                    Collection<?> col = (Collection<?>) context;
                    Collection retCol;
                    if (isInstantiable(fType)) {
                        retCol = (Collection<?>) fType.newInstance();
                    } else {
                        retCol = col.getClass().newInstance();
                    }
                    Type[] paramType = ((ParameterizedType) f.getGenericType()).getActualTypeArguments();
                    Class<?> valType = (Class<?>) paramType[0];
                    col.forEach(it -> retCol.add(convertIfYouCan(it, valType)));
                    f.set(ret, Mapper.convert(m.mapper(), retCol));
                } else if (Map.class.isAssignableFrom(fType)) {
                    if (m.mapper() != DefaultMapper.class) {
                        Type srcType = ((ParameterizedType) m.mapper().getGenericInterfaces()[0]).getActualTypeArguments()[0];
                        f.set(ret, Mapper.convert(m.mapper(), convertIfYouCan(context, srcType)));
                    } else {
                        Map<?, ?> map = (Map<?, ?>) context;
                        Map retMap;
                        if (isInstantiable(fType)) {
                            retMap = (Map) fType.newInstance();
                        } else {
                            retMap = map.getClass().newInstance();
                        }
                        Type[] paramTypes = ((ParameterizedType) f.getGenericType()).getActualTypeArguments();
                        Class<?> keyType = (Class<?>) paramTypes[0];
                        Class<?> valType = (Class<?>) paramTypes[1];
                        map.forEach((o1, o2) -> retMap.put(convertIfYouCan(o1, keyType), convertIfYouCan(o2, valType)));
                        f.set(ret, Mapper.convert(m.mapper(), retMap));
                    }
                } else if (fType.isAssignableFrom(context.getClass()) || fType.isPrimitive() || (m.mapper() != DefaultMapper.class)) {
                    f.set(ret, Mapper.convert(m.mapper(), context));
                } else if (BaseMappingObject.class.isAssignableFrom(fType)) {
                    Object obj = BaseMappingObject.from(context, (Class<? extends BaseMappingObject>) fType);
                    f.set(ret, Mapper.convert(m.mapper(), obj));
                    log.info("Cast " + f + " to " + obj);
                } else {
                    //TODO: report error
                    throw new IllegalStateException("");
                }
            }
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

}