import { Cucumber } from "./Cucumber";
import * as monaco from "monaco-editor";
import { StepManager } from "./stepManager";

export const DataTableClassName = "cucumber.api.DataTable"

export type Argument = {
    type: string,
    suggProvider: string
    start?: number,
    end?: number
}

export type IStep = {
    pattern: string;
    args?: Argument[];
    location?: string;
    docs?: string;
}

export class Step {
    pattern: RegExp;
    args?: Argument[];
    location?: string;
    docs?: string;

    constructor(pattern: string, args?: Argument[], location?: string, docs?: string) {
        this.pattern = new RegExp(pattern);
        this.location = location;
        this.docs = docs;
        this.args = this.analyzeArgs(pattern, args);
    }

    static fromIStep(istep: IStep): Step {
        return new Step(istep.pattern, istep.args, istep.location, istep.docs);
    }

    toIStep(): IStep {
        return {
            ...this,
            pattern: this.pattern.source
        };
    }

    analyzeArgs(pattern: String, args?: Argument[]): Argument[] {
        if (args && pattern !== "TODO") {
            let params = args;
            let start = 0;
            let end = 0;
            let parN = 0;
            try {
                for (let i = 1; i < pattern.length; i++) {
                    if (pattern[i] === '(' && pattern[i - 1] !== '\\' && pattern[i + 1] !== '?') {
                        start = i;
                    }
                    if (pattern[i] === ')' && pattern[i - 1] !== '\\') {
                        end = i;
                        params[parN].start = start;
                        params[parN].end = end;
                        parN++;
                    }
                }
            } catch (err) {
                console.error(err);
            }
            return params;
        } else {
            return [];
        }
    }

    analyzeParams(steps: Step[]) {
        return steps.map((step) => {
            if (step.args) {

                return step;
            } else {
                return step;
            }
        })
    }

    getPlaceholderText(): string {
        const args = this.args;
        if (args && args.length > 0) {
            const source = this.pattern.source;
            let ret = [];
            ret.push(source.substring(0, args[0].start!));
            ret.push(`\${1:${source.substring(args[0].start!, args[0].end! + 1)}}`);

            for (let i = 1; i < args.length; i++) {
                if (args[i].type === Cucumber.DATATABLE_TYPE || !args[i].start) {
                    break;
                }
                ret.push(source.substring(args[i - 1].end! + 1, args[i].start!));
                ret.push(`\${${i + 1}:${source.substring(args[i].start!, args[i].end! + 1)}}`);
            }
            ret.push(source.substring(args[args.length - 1].end! + 1));
            return ret.join("");
        }
        return this.pattern.source;
    }

    async getSuggestions(line: string, range: monaco.IRange): Promise<monaco.languages.CompletionItem[]> {
        if (this.args) {
            const sugs = this.args.filter(arg => arg.suggProvider)
                .map(val => val.suggProvider)
                .map((val, i) => StepManager.get().fetchSuggestions(val, line, i));
            const vals = await Promise.all(sugs);
            //todo figure out position
            let x: monaco.languages.CompletionItem[] = [];
            vals.forEach((type, i) => type.forEach(val => x.push(
                {
                    label: `Arg #${i}: ${val}`,
                    insertText: val,
                    kind: monaco.languages.CompletionItemKind.Value,
                    range: range
                } as monaco.languages.CompletionItem)));
            return x;
        }
        return [];
    }
}
