package mmuzikar.api;

/**
 * Provides a name for object to be exposed
 * @param <T> Object type to be exposed
 */
public interface IExposedNameProvider<T> {

    String getNameFor(T obj);
}
