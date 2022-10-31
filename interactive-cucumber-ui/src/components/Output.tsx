import { useContext } from "react"
import { useBoolean, useMount, useUpdate } from "react-use"
import { CucumberContext } from "../data/CucumberContext"
import { withLineBreaks } from "../utils/textutils"
import { StepStatus } from "../data/cucumber/EditableScenario"
import Modal from 'react-overlays/Modal'
import { SavePrompt } from "./SavePrompt"

export const Output = () => {
    const cucumber = useContext(CucumberContext)
    const [isSaving, setSaving] = useBoolean(false)

    const update = useUpdate()
    useMount(() => cucumber.currentScenario.observers.push(update))

    const sendCodeToEditor = () => {
        if (cucumber.setEditorContent) {
            cucumber.setEditorContent(cucumber.currentScenario.getText())
            cucumber.currentScenario.clear()
        }
    }

    const removeFailedStep = (i: number, prefix: string) => {
        if (prefix === 'background') {
            cucumber.currentScenario.removeBackgroundStep(i)
        } else {
            cucumber.currentScenario.removeStep(i)
        }
    }

    const clear = () => {
        cucumber.currentScenario.clear()
    }

    const save = () => {
        setSaving(true)
    }

    function renderBackdrop() {
        return <div className='backdrop' onClick={() => setSaving(false)} />
    }

    function RemoveButton({ i, prefix, onRemove, text }: { i: number, prefix: string, text: string, onRemove?: () => void }) {
        return <button onClick={e => { onRemove?.(); removeFailedStep(i, prefix) }} >{text}</button>
    }

    function Tags() {
        return cucumber.currentScenario.tags ? <ul>{cucumber.currentScenario.tags.map(tag => <li>{tag}</li>)}</ul> : <></>
    }

    function FeatureName() {
        return cucumber.currentScenario.featureName ? <><strong>Feature: {cucumber.currentScenario.featureName}</strong><br /></> : <></>
    }

    function Background() {
        if (cucumber.currentScenario.hasBackground()) {
            return <div>
                <strong>Background: {cucumber.currentScenario.background.name}</strong>
                <StepList steps={cucumber.currentScenario.background.steps} prefix='background'/>
            </div>
        }
        return <></>
    }

    function StepList({steps, prefix} : {steps: StepStatus[], prefix: string}) {
        return <ul className='output-list'>
            {steps.map((step, i) => <li key={`${prefix}-step-${i}`} className={`step-${step.status} step`}>
                {withLineBreaks(step.text)}
                <RemoveButton i={i} prefix={prefix} text='Remove' />
                <RemoveButton i={i} prefix={prefix} text='Edit' onRemove={() => cucumber.addLineToEditor?.(step.text)} />
            </li>)}
        </ul>
    }

    function ScenarioName() {
        return <strong>Scenario: {cucumber.currentScenario.name ? cucumber.currentScenario.name : <span className='log-error'>No scenario name set</span>}</strong>
    }

    return (
        <div className='grid-item'>
            <strong style={{ fontSize: '1.5em' }}>Scenario output</strong>
            <div className='align-right' style={{ display: 'inline-block' }}>
                <button onClick={save}>Save</button>
                <button onClick={clear}>Clear</button>
                <button onClick={sendCodeToEditor}>Edit</button>
            </div>
            <div style={{ width: '100%', borderBottom: '1px solid #cccbcc' }} />
            <div className='code-text'>
                <Tags />
                <FeatureName />
                <Background />

                <ScenarioName />
                <StepList steps={cucumber.currentScenario.steps} prefix='scenario'/>
            </div>
            {isSaving ? <Modal className='modal' renderBackdrop={renderBackdrop} show={isSaving}><SavePrompt close={() => setSaving(false)} /></Modal> : <></>}
        </div>
    )
}