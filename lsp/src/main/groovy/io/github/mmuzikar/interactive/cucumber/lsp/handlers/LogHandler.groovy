package io.github.mmuzikar.interactive.cucumber.lsp.handlers

import org.apache.commons.io.output.TeeOutputStream

import org.eclipse.lsp4j.jsonrpc.RemoteEndpoint
import org.eclipse.lsp4j.services.LanguageClient

import java.util.logging.Handler
import java.util.logging.LogRecord
import java.util.logging.Logger

class LogHandler {

    LanguageClient languageClient

    Handler handler

    Closure onClose

    LogHandler(LanguageClient languageClient) {
        setupStdOutput()
        setupLoggers()

        this.languageClient = languageClient
    }

    void close() {
        onClose()
    }

    private class DelegatingOutputStream extends OutputStream {
        private StringBuffer buffer = new StringBuffer(1024)

        DelegatingOutputStream() {
            super()
        }

        @Override
        void write(int b) throws IOException {
            buffer.append(b as char)
            if (buffer.charAt(buffer.size() - 1) == ('\n' as char)) {
                sendLog(buffer.toString())
                buffer.delete(0, buffer.size())
            }
        }
    }

    private void setupStdOutput() {
//        PrintStream outputPrint = new PrintStream(new DelegatingOutputStream(System.out));
//        PrintStream errorPrint = new PrintStream(new DelegatingOutputStream(System.err));
//        System.setOut(outputPrint);
//        System.setErr(errorPrint);
        OutputStream outputTee = new TeeOutputStream(System.out, new DelegatingOutputStream());
        OutputStream errorTee = new TeeOutputStream(System.err, new DelegatingOutputStream());
        PrintStream outputPrint = new PrintStream(outputTee);
        PrintStream errorPrint = new PrintStream(errorTee);
        System.setOut(outputPrint);
        System.setErr(errorPrint);
    }

    private void sendLog(def log) {
        languageClient.notify('logs', log)
    }

    private void setupLoggers() {
        Logger global = Logger.getGlobal();
        while (global.getParent() != null) {
            global = global.getParent();
        }

        handler = new Handler() {
            @Override
            public void publish(LogRecord record) {
                if (record.loggerName == "org.eclipse.lsp4j.websocket.jakarta.WebSocketMessageConsumer") {
                    return
                }
                if (record.loggerName == "main") {
                    return
                }
                sendLog("${record.loggerName}: ${record.message}".toString())
            }

            @Override
            public void flush() {
            }

            @Override
            public void close() throws SecurityException {
            }
        }

        Logger.getGlobal().addHandler(handler)
        global.addHandler(handler);

        onClose = {
            Logger.getGlobal().removeHandler(handler)
            global.removeHandler(handler)
        }
    }
}
