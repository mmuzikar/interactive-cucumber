export type Result = {
    type: ResultType,
    info?: string
}

export type HistoryResult = {
    step: string,
    id: number,
    type: ResultType
}

export enum ResultType {
    SUCCESS = "success",
    FAILURE = "failure",
    WAITING = "waiting"
}