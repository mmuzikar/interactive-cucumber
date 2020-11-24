package mmuzikar.handlers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import lombok.AllArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.io.output.TeeOutputStream;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

@Log
public class LogHandler implements Handler {

    private ByteArrayOutputStream outputCopyStream;
    private ByteArrayOutputStream outputErrorStream;
    private List<LogRecord> records;

    /**
     * Copy std outputs locally to send them over to the frontend
     */
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

    // Add logger to the root logger to catch all logs
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

    public LogHandler() {
        records = new ArrayList<>(20);
        setupLoggers();
        setupStdOutput();
    }

    @AllArgsConstructor
    private class LogPojo {
        public Object json;
        public String stdout;
        public String stderr;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            //Send over any logs
            LogPojo log = new LogPojo(records, outputCopyStream.toString(), outputErrorStream.toString());
            Handler.sendResponse(exchange, new Gson().toJson(log));
            records.clear();
            outputCopyStream.reset();
            outputErrorStream.reset();
        } catch (Exception e) {
            e.printStackTrace();
            Handler.sendResponse(exchange, e.getMessage(), 500);
        }
    }
}
