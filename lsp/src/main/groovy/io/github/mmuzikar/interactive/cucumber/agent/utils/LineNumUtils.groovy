package io.github.mmuzikar.interactive.cucumber.agent.utils

import org.objectweb.asm.ClassReader
import org.objectweb.asm.ClassVisitor
import org.objectweb.asm.Label
import org.objectweb.asm.MethodVisitor
import org.objectweb.asm.Opcodes


class LineNumUtils {

    static def latestClazz = null
    static def latestValue = null

    static Map<String, Integer> getLineNumberForMethods(Class<?> clazz) {
        if (latestClazz == clazz) {
            return latestValue
        }
        ClassReader cr = new ClassReader(clazz.getName())
        Map<String, Integer> methodMap = [:]
        cr.accept(new ClassVisitor(Opcodes.ASM9) {
            @Override
            MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
                return new MethodVisitor(Opcodes.ASM9) {
                    @Override
                    void visitLineNumber(int line, Label start) {
                        methodMap.putIfAbsent(name, line)
                    }
                }
            }
        }, 0)
        latestClazz = clazz
        latestValue = methodMap
        return methodMap
    }
}
