package mmuzikar.utils;

import lombok.extern.java.Log;

import java.lang.reflect.Field;
import java.util.function.Function;

@Log
public class ReflectionUtils {

    public static  <T> T instantiate(Class<? extends T> type){
        try {
            return type.newInstance();
        } catch (Exception e){
            log.info("Had trouble initiating " + type.getName());
        }
        return null;
    }


    public static void setFrom(Object src, Object dst, String fieldName){
        setFrom(src, dst, fieldName, fieldName);
    }

    public static void setFrom(Object src, Object dst, String srcFieldName, String dstFieldName){
        setFrom(src, dst, srcFieldName, dstFieldName, (o) -> o);
    }


    public static<S, R> void setFrom(Object src, Object dst, String srcFieldName, String dstFieldName, Function<S, R> map){
        try {
            Field srcF = src.getClass().getDeclaredField(srcFieldName);
            Field dstF = dst.getClass().getDeclaredField(dstFieldName);
            srcF.setAccessible(true);
            dstF.setAccessible(true);
            S srcVal = ((S) srcF.get(src));
            R dstVal = map.apply(srcVal);
            dstF.set(dst, dstVal);
        } catch (Exception e){
            e.printStackTrace();
            //NOOP
        }
    }

    public static <T> T dynamicCast(Object o, Class<? extends T> type) {
        Field[] fields = type.getDeclaredFields();
        T ret = instantiate(type);
        for (Field f: fields) {
            try {
                Field fOther = o.getClass().getDeclaredField(f.getName());
                fOther.setAccessible(true);
                f.setAccessible(true);
                f.set(ret, fOther.get(o));
            } catch (Exception e){
                //NOOP
            }
        }
        return ret;
    }

    public static boolean hasField(Object o, String name){
        try{
            o.getClass().getDeclaredField(name);
            return true;
        } catch (Exception e){
            return false;
        }
    }

    public static <T> T get(Object o, String name){
        try{
            Field f = o.getClass().getDeclaredField(name);
            f.setAccessible(true);
            return (T)f.get(o);
        } catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }

}
