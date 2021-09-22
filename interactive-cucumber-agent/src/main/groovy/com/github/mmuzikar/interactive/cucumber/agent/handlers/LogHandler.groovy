package com.github.mmuzikar.interactive.cucumber.agent.handlers

import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange

import org.apache.commons.io.output.TeeOutputStream

import java.util.logging.LogRecord
import java.util.logging.Logger

class LogHandler implements Handler{

    private ByteArrayOutputStream outputCopyStream;
    private ByteArrayOutputStream outputErrorStream;
    private List<LogRecord> records = [];

    LogHandler(){
        setupStdOutput()
        setupLoggers()
    }

    private void setupStdOutput(){
        outputCopyStream = new ByteArrayOutputStream(1000);
        outputErrorStream = new ByteArrayOutputStream(1000);
        OutputStream outputTee = new TeeOutputStream(System.out, outputCopyStream);
        OutputStream errorTee = new TeeOutputStream(System.err, outputErrorStream);
        PrintStream outputPrint = new PrintStream(outputTee);
        PrintStream errorPrint = new PrintStream(errorTee);
        System.setOut(outputPrint);
        System.setErr(errorPrint);
    }

    private void setupLoggers(){
        Logger global = Logger.getGlobal();
        while (global.getParent() != null){
            global = global.getParent();
        }
        global.addHandler(new java.util.logging.Handler() {
            @Override
            public void publish(LogRecord record) {
                records.add(record);
            }

            @Override
            public void flush() {

            }

            @Override
            public void close() throws SecurityException {

            }
        });
    }

    void handle(HttpExchange exchange) throws IOException {
        sendResponse(exchange, new Gson().toJson([
                stdout: outputCopyStream.toString(),
                stderr: outputErrorStream.toString(),
                json: records
        ]))
        records.clear()
        outputCopyStream.reset()
        outputErrorStream.reset()
    }
}
