package mmuzikar.api;

public interface IExposedNameProvider<T> {

    String getNameFor(T obj);
}
