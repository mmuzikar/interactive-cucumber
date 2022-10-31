import { postApi } from "../../utils/Utils"
import { Argument } from "./Arguments"

export class StepDefinition {
    pattern: string
    arguments: Argument[]
    docs?: string
    location?: {
        className: string,
        methodName: string,
        lineNum: number
    }
    tags: string[]
    private regexPattern?: RegExp

    private static LOCATON_REGEX = /(.*)#(.*):(\d+)/;


    constructor(pattern: string, args: Argument[], location: string, docs: string | undefined, tags: string[]) {
        this.pattern = pattern
        this.arguments = args
        this.docs = docs
        this.tags = tags
        const result = StepDefinition.LOCATON_REGEX.exec(location)
        if (result) {
            this.location = {
                className: result[1],
                methodName: result[2],
                lineNum: Number(result[3])
            }
        }

        if (pattern.startsWith("^") && pattern.endsWith("$")) {
            try {
                let regex = new RegExp(pattern)
                this.regexPattern = regex
            } catch (e) {

            }
        }
    }

    public matches(text: string): boolean {
        if (this.regexPattern) {
            return this.regexPattern.test(text)
        } else {
            //TODO
            return false
        }
    }

    public asSnippetPattern(): string {
        if (this.regexPattern) {
            const regexRemoved = this.getPatternWithoutControlChars()
            const pattern = regexRemoved
            let params: { start: number, end: number }[] = []
            let start = 0, end = 0, parN = 0
            for (let i = 1; i < pattern.length; i++) {
                if (pattern[i] === '(' && pattern[i - 1] !== '\\' && pattern[i + 1] !== '?') {
                    start = i;
                }
                if (pattern[i] === ')' && pattern[i - 1] !== '\\') {
                    end = i;
                    params[parN] = {
                        start: start,
                        end: end
                    }
                    parN++;
                }
            }
            if (params.length > 0) {
                let ret = [];
                ret.push(pattern.substring(0, params[0].start));
                ret.push(`\${1:${pattern.substring(params[0].start, params[0].end + 1)}}`);
                let i = 1;
                for (i = 1; i < params.length; i++) {
                    ret.push(pattern.substring(params[i - 1].end + 1, params[i].start));
                    ret.push(`\${${i + 1}:${pattern.substring(params[i].start, params[i].end + 1)}}`);
                }
                ret.push(pattern.substring(params[params.length - 1].end + 1));
                if (this.arguments[this.arguments.length - 1].type.endsWith("DataTable")) {
                    ret.push(`\n\t| \${${i + 1}:<table-val>} |`);
                } else if (params.length !== this.arguments.length && this.arguments[this.arguments.length - 1]?.type.endsWith("String")) {
                    ret.push(`\n"""\n\${${i + 1}:<string-val>}\n"""`)
                }
                return ret.join("");
            } else {
                return pattern
            }
        } else {
            let i = 1;
            let snippet = this.pattern.replaceAll(/{[^}]*}/g, (val) => {
                if (val === '{string}') {
                    return `"\${${i++}:...}"`
                } else {
                    return `\${${i++}:${val}}`
                }
            })
            if (this.arguments[this.arguments.length - 1]?.type.endsWith("DataTable")) {
                snippet += `\n\t| \${${i + 1}:<table-val>} |`;
            } else if (i === this.arguments.length && this.arguments[this.arguments.length - 1]?.type.endsWith("String")) {
                snippet += `\n"""\n\${${i + 1}:<string-val>}\n"""`
            }
            return snippet
        }
    }

    public getPatternWithoutControlChars() {
        if (this.regexPattern) {
            return this.pattern.substring(1, this.pattern.length - 1)
        }
        return this.pattern
    }

    public async provideSuggestions(text: string): Promise<{ id: number, val: string[] }[]> {
        if (this.arguments) {
            let ret: Promise<{ id: number, val: string[] }>[] = []
            for (let i = 0; i < this.arguments.length; i++) {
                if (this.arguments[i].suggProvider && this.arguments[i].suggProvider.length > 0) {
                    ret.push(new Promise(async (resolve, reject) => {
                        const resp = await postApi('suggestions', JSON.stringify({
                            providerType: this.arguments[i].suggProvider,
                            stepVal: text
                        }))
                        const vals = await resp.json() as string[]
                        resolve({
                            id: i,
                            val: vals
                        })
                    }));
                }
            }
            return Promise.all(ret)
        }
        return Promise.resolve([])
    }

    public async run() {

    }
}
