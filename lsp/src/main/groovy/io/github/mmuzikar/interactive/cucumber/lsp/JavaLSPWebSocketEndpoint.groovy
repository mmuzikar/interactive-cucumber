package io.github.mmuzikar.interactive.cucumber.lsp

import static io.github.mmuzikar.interactive.cucumber.Main.LOG

import org.apache.commons.io.FileUtils

import org.javacs.Main
import org.javacs.lsp.DidChangeWatchedFilesParams
import org.javacs.lsp.FileChangeType
import org.javacs.lsp.FileEvent
import org.javacs.lsp.LSP
import org.javacs.lsp.NotificationMessage
import org.javacs.streams.IOReader
import org.javacs.streams.IOWriter

import com.google.gson.Gson
import com.google.gson.JsonParser

import java.nio.charset.Charset
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.logging.Handler
import java.util.logging.LogRecord
import java.util.logging.Logger

import io.github.mmuzikar.interactive.cucumber.api.ExposeManager
import jakarta.websocket.CloseReason
import jakarta.websocket.Endpoint
import jakarta.websocket.EndpointConfig
import jakarta.websocket.MessageHandler
import jakarta.websocket.Session

class JavaLSPWebSocketEndpoint extends Endpoint {

    private static def gson = new Gson()
    private Handler handler

    private Path tempDir
    private static final String packageName = 'io.github.mmuzikar.interactive.cucumber.api';

    JshellEndpoint jshellEndpoint

    IOReader serverInput
    IOWriter serverOutput

    @Override
    void onOpen(Session session, EndpointConfig config) {
        def remote = session.getBasicRemote()
        jshellEndpoint = new JshellEndpoint(remote)

        tempDir = File.createTempDir("java-temp-files").toPath()
        tempDir.toFile().deleteOnExit()

        serverInput = new IOReader()
        serverOutput = new IOWriter({ String s ->
            if (!s.startsWith("Content-Length")) {
                s = s.replaceAll('"uri":"(\\w+)://([^"]*)"', {
                    if (it[1] == "file:jar") {
                        return it[0]
                    }
                    String uri = it[2]
                    if (uri.startsWith(tempDir.toString())) {
                        uri = uri.substring(tempDir.toString().size())
                        return "\"uri\":\"remote://${uri}\""
                    }
                    if (!uri.contains(System.getProperty("localRepository"))) {
                        def relative = Paths.get("").toAbsolutePath().relativize(Path.of(uri))
                        return "\"uri\":\"remote:/${relative}\""
                    } else {
                        //Return absolute paths to maven repo
                        return "\"uri\":\"remote://${uri}\""
                    }
                })
                //Turn on full sync
                s = s.replace('"textDocumentSync":2', '"textDocumentSync":1')
                remote.sendText(s)
            }
        })
        handler = new Handler() {
            @Override
            void publish(LogRecord logRecord) {
                remote.sendText(gson.toJson(["jsonrpc": "2.0", "method": "logs", "params": [logRecord.message]]))
            }

            @Override
            void flush() {
            }

            @Override
            void close() throws SecurityException {
            }
        }

        LSP.headersEnabled = false
        def server = new Thread({
            Logger.getLogger("main").addHandler(handler)
            Main.runEmbedded(serverInput, serverOutput)
        })
        server.setDaemon(true)
        server.start()

        session.addMessageHandler(String, new MessageHandler.Whole<String>() {
            @Override
            void onMessage(String message) {
                def jsonObj = JsonParser.parseString(message).asJsonObject

                def method = jsonObj.get("method").asString
                def params = jsonObj.get("params").asJsonObject
                def document = params.get("textDocument").with {
                    if (it?.isJsonObject()) {
                        return it.asJsonObject
                    }
                    return null
                }
                if (method.startsWith("jshell")) {
                    jshellEndpoint.execute(jsonObj)
                    return
                }
                switch (method) {
                    case "initialize":
                        params.addProperty('rootPath', System.getProperty("user.dir"))
                        params.addProperty('rootUri', "file://" + System.getProperty("user.dir"))
                        break;
                    case "textDocument/didOpen":
                        def uri = URI.create(document.get("uri").asString)
                        def file = resolveFile(uri)
                        if (!file.toFile().exists()) {
                            Files.createDirectories(file.getParent())
                            file.toFile().createNewFile()
                            file.write(document.get("text").asString)
                        }
                        break;
                    case "textDocument/didChange":
                        def contentChanges = params.get("contentChanges").asJsonArray
                        def file = resolveFile(URI.create(document.get("uri").asString))
                        FileUtils.write(file.toFile(), contentChanges.first().asJsonObject.get("text").asString, Charset.defaultCharset(),false)
                        break;
                }
                message = jsonObj.toString()
                message = message.replaceAll('"uri":"(\\w+):([^"]*)"', {
                    String uri = it[2] as String
                    String scheme = it[1] as String

                    def jsonUri = {
                        return "\"uri\":\"${it}\""
                    }

                    if (scheme == "remote") {
                        uri = URLDecoder.decode(uri, StandardCharsets.UTF_8)
                        if (uri.startsWith(System.getProperty("localRepository"))) {
                            return jsonUri("file://${uri}")
                        }
                        if (uri.startsWith("/")) {
                            uri = uri.substring(1)
                        }
                        uri = Path.of(uri).toUri().toString()
                    } else if (scheme == "jar") {
                        uri = "jar:" + URLDecoder.decode(uri, StandardCharsets.UTF_8)
                    } else if (scheme == "file") {
                        return jsonUri(resolveFile(URI.create("${scheme}:${uri}")).toUri())
                    }
                    return jsonUri(uri)
                })
                serverInput.write(message + "\r\n")
            }
        })

        LOG.info("Using directory ${tempDir.toAbsolutePath()} for temporary Java sources");

        ExposeManager.listenForChanges(this::onVariablesChanged)
        onVariablesChanged()


    }

    private void onVariablesChanged() {
        ExposeManager.getExposedValues().each {
            jshellEndpoint.registerVariable(it.getKey(), it.getValue())
        }
        def fields = ExposeManager.getExposedValues().collect {
            def type = it.value.class.name
            def name = it.key

            "public static ${type} ${name} = ${ExposeManager.class.name}.getVariable(\"${name}\");"
        }.join('\n')

        createInternalJavaObject("Variables", getBasicClassSource('Variables', fields))

        createBasicRunnerClass(fields)
    }

    private void createBasicRunnerClass(String fields) {
//        ClassPool cp = ClassPool.getDefault()
//        if (!runnerClass) {
//            ClassFile cf = new ClassFile(false, "${packageName}.BaseRunnerScript", null)
//            cf.setAccessFlags(AccessFlag.PUBLIC | AccessFlag.ABSTRACT)
//            runnerClass = cp.makeClass(cf)
//            runnerClassRef = runnerClass.toClass()
//        }
//        if (runnerClass) {
//            runnerClass.defrost();
//            runnerClass.fields.each {runnerClass::removeField }
//
//            ExposeManager.getExposedValues().forEach { String key, def value ->
//                runnerClass.addField(CtField.make("public static ${value.class.name} ${key};", runnerClass))
//            }
//            instrumentation.redefineClasses(new ClassDefinition(runnerClassRef, runnerClass.toBytecode()))
//
//            runnerClassRef.fields.each {
//                runnerClassRef.getField(it.name).set(runnerClassRef, ExposeManager.getField(it.name))
//            }
//        }

        def source = """
package $packageName;

public abstract class BaseRunnerScript {
    ${fields}

    public abstract void run() {
    
    }

}
"""
        createInternalJavaObject("BaseRunnerScript", source)
    }

    private Path resolveFile(URI uri) {
        if (uri.scheme == "file") {
            def path = uri.path
            if (path.startsWith("/")) {
                path = path.substring(1)
            }
            def file = tempDir.resolve(path)
            return file

        }
        return null
    }

    @Override
    void onClose(Session session, CloseReason closeReason) {
        super.onClose(session, closeReason)
        Logger.getLogger("main").removeHandler(handler)
        tempDir.deleteDir()
        serverInput.close()
        serverOutput.close()
    }

    private static String getBasicClassSource(String name, String source) {
        return """
package io.github.mmuzikar.interactive.cucumber.api;

public class $name {
    ${source}
}
"""
    }

    private String createInternalJavaObject(String name, String source) {
        def variablesFile = tempDir.resolve("${name}.java")
        FileUtils.write(variablesFile.toFile(), source, StandardCharsets.UTF_8)
        notifyDidChangeFile(variablesFile.toUri())

        return source
    }


    void notifyDidChangeFile(URI uri) {
        NotificationMessage message = new NotificationMessage();
        message.method = 'workspace/didChangeWatchedFiles';
        DidChangeWatchedFilesParams params = new DidChangeWatchedFilesParams();
        FileEvent event = new FileEvent();
        event.type = FileChangeType.Created
        event.uri = uri
        params.changes = [event];
        message.params = gson.toJsonTree(params)
        serverInput.write(gson.toJson(message) + '\r\n');
    }
}
