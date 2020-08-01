package mmuzikar.datamapping;

import com.google.common.collect.Lists;
import lombok.AllArgsConstructor;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class MappingTests {

    private static final class Test1 extends BaseMappingObject {
        @CallWhenVersion("3.x")
        private void get3(Object obj) {
            this.str = "hello world";
            this.i1 += ((Obfu3) obj).i;
        }

        @Mapping(declaredVersion = "1.x", fieldName = "string")
        @Mapping(declaredVersion = "2.x", fieldName = "inner.s")
        String str;
        @Mapping(declaredVersion = "x", fieldName = "i")
        int i1;

        @Mapping(declaredVersion = "4.x", fieldName = "inner")
        Test2 test2;
    }

    @AllArgsConstructor
    private static final class Obfu1 {
        String string;
        int i;
    }

    @AllArgsConstructor
    private static final class Obfu2 {
        @AllArgsConstructor
        private static final class ObfuInner {
            String s;
        }

        ObfuInner inner;
        int i;
    }

    @AllArgsConstructor
    private static final class Obfu3 {
        int i;
    }

    @AllArgsConstructor
    private static final class ObfuCollection {
        List<Obfu1> strList;
        Map<String, Obfu1> strMap;
    }

    private static final class Test2 extends BaseMappingObject {
        @Mapping(declaredVersion = "4.x", fieldName = "s")
        @Mapping(declaredVersion = "1.x", fieldName = "string")
        String s;
    }

    private static final class CollectionTest extends BaseMappingObject {
        @Mapping(declaredVersion = "1.x", fieldName = "strMap")
        Map<String, Test2> test2Map;
        @Mapping(declaredVersion = "1.x", fieldName = "strList")
        List<Test2> test2List;
    }

    @Test
    public void happyPath() {
        BaseMappingObject.versionSupplier = () -> new Version(1);
        Test1 t = BaseMappingObject.from(new Obfu1("hello world", 1), Test1.class);
        assertThat(t.str).isEqualTo("hello world");
        assertThat(t.i1).isEqualTo(1);
    }

    @Test
    public void longerPath() {
        BaseMappingObject.versionSupplier = () -> new Version(2);
        Test1 t = BaseMappingObject.from(new Obfu2(new Obfu2.ObfuInner("hello world"), 1), Test1.class);
        assertThat(t.str).isEqualTo("hello world");
        assertThat(t.i1).isEqualTo(1);
    }

    @Test
    public void objectGetter() {
        BaseMappingObject.versionSupplier = () -> new Version(3);
        Test1 t = BaseMappingObject.from(new Obfu3(3), Test1.class);
        assertThat(t.str).isEqualTo("hello world");
        assertThat(t.i1).isEqualTo(4);
    }

    @Test
    public void innerObjects() {
        BaseMappingObject.versionSupplier = () -> new Version(4);
        Test1 t = BaseMappingObject.from(new Obfu2(new Obfu2.ObfuInner("hello world"), 1), Test1.class);
        assertThat(t.test2.s).isEqualTo("hello world");
        assertThat(t.i1).isEqualTo(1);
    }

    @Test
    public void listObjects() {
        BaseMappingObject.versionSupplier = () -> new Version(1);
        Obfu1 firstElement = new Obfu1("hello", 1);
        CollectionTest ct = BaseMappingObject.from(new ObfuCollection(Lists.newArrayList(firstElement, new Obfu1("world", 2)), null), CollectionTest.class);
        assertThat(ct.test2List.size()).isEqualTo(2);
        assertThat(ct.test2List.stream().map(test2 -> test2.s)).contains("hello", "world");
    }

    @Test
    public void mapObjects() {
        BaseMappingObject.versionSupplier = () -> new Version(1);
        Obfu1 firstElement = new Obfu1("hello", 1);
        Map<String, Obfu1> testMap = new HashMap<>();
        testMap.put("h", firstElement);
        testMap.put("w", new Obfu1("world", 2));
        CollectionTest ct = BaseMappingObject.from(new ObfuCollection(Lists.newArrayList(), testMap), CollectionTest.class);
        assertThat(ct.test2Map.size()).isEqualTo(2);
        assertThat(ct.test2Map).containsKeys("h", "w");
        assertThat(ct.test2Map.values().stream().map(test2 -> test2.s)).contains("hello", "world");
    }

}
