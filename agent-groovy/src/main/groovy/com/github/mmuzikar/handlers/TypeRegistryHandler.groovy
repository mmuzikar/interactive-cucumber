package com.github.mmuzikar.handlers

import com.github.interactive.cucumber.DataSuggestion
import com.github.mmuzikar.CucumberInterceptor
import com.google.gson.Gson
import com.sun.net.httpserver.HttpExchange


class TypeRegistryHandler implements Handler {

	/**
	 * Simple GET requests returns JSON object with {parameterTypes: [...], docStringTypes: [...], dataTableTypes: [...]}* where parameterType: {*     name: string,
	 *     regexes: string[],
	 *     type: string //FQN
	 *}* docStringType: {*     type: string //FQN
	 *     name: string
	 *}* dataTableType: {*     ...
	 *}* @param exchange
	 * @throws IOException
	 */
	void handle(HttpExchange exchange) throws IOException {
		def typeRegistry = CucumberInterceptor.cucumber.typeRegistry
		def parameters = typeRegistry.parameterTypeRegistry.getParameters()
		def docTypes = typeRegistry.docStringTypeRegistry.getDocStringTypes()

		def ret = [
				parameterTypes: parameters.collect {
					def ret = [
							name   : it.name,
							regexes: it.regexps,
							type   : it.type.typeName,
					]
					if (it.type instanceof Class) {
						def clazz = it.type as Class
						def a = clazz.getAnnotation(DataSuggestion)
						if (a) {
							ret.suggProvider = (a as DataSuggestion).value().name
						}
					}
					return ret
				},
				docStringTypes: docTypes.collect {
					[
							name: it.contentType,
							type: it.type.typeName
					]
				}
		]

		sendResponse(exchange, new Gson().toJson(ret))
	}
}
