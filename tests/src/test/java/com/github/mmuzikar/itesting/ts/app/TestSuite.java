package com.github.mmuzikar.itesting.ts.app;

import org.junit.jupiter.api.Assertions;

import org.apache.commons.io.IOUtils;
import org.awaitility.Awaitility;
import org.awaitility.Duration;

import java.io.File;
import java.io.IOException;
import java.net.ConnectException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.Date;

import io.restassured.RestAssured;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TestSuite implements AutoCloseable {

    private Process process;
    private String logPrefix;
    private boolean isDirty;

    public void start() throws IOException {
        logPrefix = "target/ts-" + new Date();
        process = new ProcessBuilder("mvn", "verify")
            .directory(new File(Paths.get("..", "examples", "cucumber-6.2.2").toString()))
            .redirectOutput(new File(logPrefix + "out.log"))
            .redirectError(new File(logPrefix + "err.log"))
            .start();
        log.info("App running with logs at {}", logPrefix);
        Awaitility.await().atMost(Duration.ONE_MINUTE).pollInterval(Duration.FIVE_SECONDS).until(() -> {
            try {
                return RestAssured.get("/").thenReturn().statusCode() == 200;
            } catch (Exception e) {
                return false;
            }
        });
        isDirty = false;
    }

    public void restart() {
        if (!isRunning()) {
            try {
                start();
            } catch (IOException e) {
                Assertions.fail("Failed to start app", e);
            }
        } else {
            if (isDirty) {
                try {
                    close();
                    start();
                } catch (Exception e) {
                    log.error("Failed to restart process", e);
                }
            }
        }
    }

    public boolean isRunning() {
        return process != null && process.isAlive();
    }

    public void setDirty() {
        isDirty = true;
    }

    public String getLogs() {
        try {
            return IOUtils.toString(new File(logPrefix + "out.log").toURI(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to read app logs {}", logPrefix, e);
            Assertions.fail("Failed to read app logs " + logPrefix, e);
            return null;
        }
    }

    @Override
    public void close() throws Exception {
        process.destroy();
        process.waitFor();
    }
}
