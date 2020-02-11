export type Argument = {
    type: string,
    suggProvider: string
    start?: number,
    end?: number
}

export type Step = {
    pattern: string,
    args?: Argument[],
    location?: string,
    docs?: string,
}