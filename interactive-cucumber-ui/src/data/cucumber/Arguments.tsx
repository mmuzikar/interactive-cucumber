export type Argument = (RegexArgument | GherkinArgument) & {
    type: string,
    suggProvider: string
}

export type RegexArgument = {
    pattern: RegExp
}
export type GherkinArgument = {
    name: string
}
