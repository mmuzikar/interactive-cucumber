import { EditableScenario, StepStatus } from "../data/cucumber/EditableScenario";
import { Feature } from "../data/cucumber/Feature";


export const withLineBreaks = (text: string) => (
    <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
)

export const BACKGROUND_CONFLICT_PREFIX = '#+ NEW STEP:'

export function diffScenarioBackground(feature: string, background: StepStatus[]): string {
    const lines = feature.split('\n')
    const i = lines.findIndex(s => s.match(/Background:/)) + 1
    const start = lines.slice(0, i)
    const steps = background.map(s => `${BACKGROUND_CONFLICT_PREFIX} ${s.text.replaceAll('\n', '\n#')}`)
    const end = lines.slice(i)

    return [...start, ...steps, ...end].join('\n')
}

//Same functionality as in agent SaveHandler#mergeExisting
export function mergeScenarioToFeature(feature: Feature, scenario: EditableScenario): string {
    const sourceLines = feature.source.split('\n')

    let startLine = sourceLines.findIndex(s => s.match(`Scenario: ${scenario.name}`))
    if (startLine === -1) {
        startLine = sourceLines.length
    }

    let endLine = sourceLines.findIndex((s, i) => i > startLine && s.match(/\s*Scenario:.*/))
    if (endLine === -1) {
        endLine = sourceLines.length
    }

    return [
        ...sourceLines.slice(0, startLine),
        ...scenario.getText(false).split('\n'),
        ...sourceLines.slice(endLine, sourceLines.length)
    ].join('\n')
}