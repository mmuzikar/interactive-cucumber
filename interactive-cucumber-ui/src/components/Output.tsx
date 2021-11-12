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

    const renderStepList = (steps: StepStatus[], prefix: string) => <ul className='output-list'>
        {steps.map((step, i) => <li key={`${prefix}-step-${i}`} className={`step-${step.status}`} onClick={() => removeFailedStep(i, prefix)}>{withLineBreaks(step.text)}</li>)}
    </ul>

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
                {cucumber.currentScenario.tags ? <ul>{cucumber.currentScenario.tags.map(tag => <li>{tag}</li>)}</ul> : <></>}
                {cucumber.currentScenario.featureName ? <><strong>Feature: {cucumber.currentScenario.featureName}</strong><br /></> : <></>}
                {cucumber.currentScenario.hasBackground() ? <div>
                    <strong>Background: {cucumber.currentScenario.background.name}</strong>
                    {renderStepList(cucumber.currentScenario.background.steps, 'background')}
                </div> : <></>}

                <strong>Scenario: {cucumber.currentScenario.name ? cucumber.currentScenario.name : <span className='log-error'>No scenario name set</span>}</strong>
                {renderStepList(cucumber.currentScenario.steps, 'scenario')}
            </div>
            {isSaving ? <Modal className='modal' renderBackdrop={renderBackdrop} show={isSaving}><SavePrompt close={() => setSaving(false)} /></Modal> : <></>}
        </div>
    )
}