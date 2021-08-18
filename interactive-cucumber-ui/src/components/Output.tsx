import { useContext } from "react"
import { useAlert } from "react-alert"
import { useMount, useUpdate } from "react-use"
import { fetchAPI, postApi } from "../config/Utils"
import { CucumberContext } from "../data/CucumberContext"
import { withLineBreaks } from "../utils/textutils"


export const Output = () => {
    const cucumber = useContext(CucumberContext)

    const alert = useAlert()
    const update = useUpdate()
    useMount(() => cucumber.currentScenario.observers.push(update))

    const sendCodeToEditor = () => {
        if (cucumber.setEditorContent) {
            cucumber.setEditorContent(cucumber.currentScenario.getText())
            cucumber.currentScenario.clear()
        }
    }

    const removeFailedStep = (i: number) => {
        cucumber.currentScenario.removeStep(i)
    }

    const clear = () => {
        cucumber.currentScenario.clear()
    }

    const save = () => {
        let uri = cucumber.currentScenario.featureId?.replace('classpath:', '')
        if (!uri) {
            if (cucumber.currentScenario.featureName) {
                const foundFeat = cucumber.features.find(feat => feat.name === cucumber.currentScenario.featureName)
                if (foundFeat) {
                    uri = foundFeat.uri
                } else {
                    const uriProposal = cucumber.currentScenario.featureName.replaceAll(/\s/g, '_').toLowerCase() + '.feature'
                    const shouldSave = window.confirm(`Would you like to create a new feature file at path 'resources/${uriProposal}'?`)
                    if (shouldSave) {
                        uri = uriProposal
                    } else {
                        return;
                    }
                }
            } else {
                const uriInput = prompt('Please set your filename', 'features/myFeature.feature')
                if (uriInput) {
                    uri = uriInput
                } else {
                    alert.error('Please set your filename or set feature and scenario names to autogenerate')
                    return
                }
            }
        }

        if (!cucumber.currentScenario.name) {
            const scenarioName = prompt("Please set your scenario name")
            if (scenarioName) {
                cucumber.currentScenario.name = scenarioName
            } else {
                return
            }
        }

        postApi('save', JSON.stringify({
            uri: uri,
            scenarioName: cucumber.currentScenario.name,
            content: cucumber.currentScenario.getText()
        }))
        clear()
        alert.info('Saved!')

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
                {cucumber.currentScenario.tags ? <ul>{cucumber.currentScenario.tags.map(tag => <li>{tag}</li>)}</ul> : <></>}
                {cucumber.currentScenario.featureName ? <><strong>Feature: {cucumber.currentScenario.featureName}</strong><br /></> : <></>}
                <strong>Scenario: {cucumber.currentScenario.name ? cucumber.currentScenario.name : <span className='log-error'>No scenario name set</span>}</strong>
                <ul className='output-list'>
                    {cucumber.currentScenario.steps.map((step, i) =>
                        <li key={`output-step-${i}`} className={`step-${step.status}`} onClick={() => removeFailedStep(i)}>{withLineBreaks(step.text)}</li>)}
                </ul>
            </div>
        </div>
    )
}