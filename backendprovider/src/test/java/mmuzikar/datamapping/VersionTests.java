package mmuzikar.datamapping;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class VersionTests {

    @Test
    public void sameVersionsMatch() {
        Version v1 = new Version(1, 2, 1);
        Version v2 = new Version(1, 2, 1);
        assertThat(Version.match(v1, v2)).isTrue();
    }

    @Test
    public void differentVersionsDontMatch() {
        Version v1 = new Version(1, 2, 1);
        Version v2 = new Version(1, 1, 1);
        assertThat(Version.match(v1,v2)).isFalse();
    }

    @Test
    public void wildCard() {
        Version v1 = new Version(1, 2);
        Version v2 = new Version(1, 2, 1);
        assertThat(Version.match(v1,v2)).isTrue();
    }
}
