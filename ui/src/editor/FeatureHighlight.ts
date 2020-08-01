import * as monaco from "monaco-editor";
import { languages, editor } from "monaco-editor"
import { StepManager } from "../interop/stepManager";
import { INPUT_ID, OUTPUT_ID } from "./CommonFeatures";
import { Services } from "../interop/Services";

export function register(){
    languages.register({id: INPUT_ID});
    languages.register({id: OUTPUT_ID});
    registerLexer(INPUT_ID);
    registerLexer(OUTPUT_ID);
    registerProvider();
}

function registerLexer(id: string){
    languages.setMonarchTokensProvider(id, {
        defaultToken: 'invalid',
        symbols: ['"', "'"],
        tokenizer: {
            root: [
                [/#.*$/, 'comment'],
                [/@[\w\-]*/, 'annotation'],
                [/(?:Feature|Scenario|Background):/, 'keyword', '@description'],
                [/(?:Then|When|And|Given|But)/, 'keyword', '@step'],
                [/\|/, 'delimiter', '@table'],
                [/"""/, 'string', '@multilineString']
            ],
            description: [
                [/.*/, 'identifier', '@pop']
            ], 
            table: [
                [/[^\|]/, 'string.table'],
                [/\|\s*$/, 'delimiter', '@pop'],
                [/\|/, 'delimiter'],
            ], 
            step: [
                [/"[^"]*"$/, 'string', '@pop'],
                [/\S$/, 'identifier', '@pop'],
                [/\s$/, 'whitespace', '@pop'],
                [/"[^"]*"/, 'string'],
                [/\S/, 'identifier'],
                [/\s/, 'whitespace']
            ],
            multilineString: [
                [/.*"""/, 'string', '@pop'],
                [/.*$/, 'string'],
            ]
        }
    } as any);
}

function registerProvider(){
    languages.registerCompletionItemProvider(INPUT_ID, {
        async provideCompletionItems(model: editor.ITextModel, position: monaco.Position, context: monaco.languages.CompletionContext, token: monaco.CancellationToken){
            const items = await Services.get().provideSuggestions(model, position, context);
            const suggestions: monaco.languages.CompletionList = {
                suggestions: items
            }
            return suggestions;
        }
    })
}


