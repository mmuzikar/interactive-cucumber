import Editor, { DiffEditor } from "@monaco-editor/react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useAlert } from "react-alert"
import { FaTimesCircle } from "react-icons/fa"
import { CucumberContext } from "../data/CucumberContext"
import { BACKGROUND_CONFLICT_PREFIX, diffScenarioBackground, featureNameToUri, FEATURE_AUTO_NAME, mergeScenarioToFeature } from "../utils/textutils"
import { saveScenario } from "../utils/Utils"

export const DIFF_LANGUAGE = 'feature-diff'

export function SavePrompt({ close }: { close: () => void }) {

    const cucumber = useContext(CucumberContext)
    const alert = useAlert()

    const [feature, setFeature] = useState(() => {
        if (cucumber.currentScenario.featureName) {
            const feat = cucumber.features.find(feat => feat.name === cucumber.currentScenario.featureName)
            return feat ? feat.uri : featureNameToUri(cucumber.currentScenario.featureName)
        } else {
            return featureNameToUri(FEATURE_AUTO_NAME)
        }
    })
    const [scenario, setScenario] = useState(cucumber.currentScenario.name)

    const [featureSource, setFeatureSource] = useState<string>()

    let featureInput

    useEffect(() => {
        cucumber.currentScenario.name = scenario
    }, [scenario, cucumber.currentScenario])

    featureInput = <input type='string' placeholder='features/myFeature.feature' value={feature} onChange={e => setFeature(e.target.value)} list='feature-suggestion' />

    const currentFeature = useMemo(() => {
        return cucumber.features.find(feat => feat.uri === feature)
    }, [feature, cucumber.features])

    const possibleScenarios = useMemo(() => {
        return currentFeature?.scenarios?.map(sc => sc.name)
    }, [currentFeature])

    const backgroundsDifferent = useMemo(() => {
        if (cucumber.currentScenario.hasBackground()) {
            const steps = cucumber.currentScenario.background.steps
            if (currentFeature) {
                //Check if background matches the new scenario
                if (currentFeature.background) {
                    let areSame = currentFeature.background.steps.length === steps.length
                    areSame = areSame && currentFeature.background.steps.every((s, i) => steps[i].text === s.keyword + s.text)
                    //User input is needed
                    return !areSame
                } else {
                    //New background should be set
                    return false
                }
            }
            //New file, so no background drama
            return false
        }
        return false
    }, [currentFeature, cucumber.currentScenario])

    const conflictsResolved = useMemo(() => {
        if (!backgroundsDifferent){
            return true
        }
        return !featureSource?.includes(BACKGROUND_CONFLICT_PREFIX)
    }, [backgroundsDifferent, featureSource])

    function submit() {
        if (backgroundsDifferent) {
            saveScenario(featureSource!, feature!, scenario!, true)
        } else {
            saveScenario(cucumber.currentScenario.getText(), feature!, scenario!)
        }
        alert.success(`Saved changes to file ${feature}`)
        close()
    }

    let source = mergeScenarioToFeature(currentFeature, cucumber.currentScenario)

    if (backgroundsDifferent) {
        source = diffScenarioBackground(source,  cucumber.currentScenario.background.steps)
    }

    //TODO: split editor from input editor and provide features for easier resolving of conflicts
    return <div>
        <h2>Save scenario</h2>
        <div>
            <label>Feature URI</label>
            {featureInput}
            <datalist id='feature-suggestion'>
                {cucumber.features.map(f => <option value={f.uri} label={f.name} />)}
            </datalist>
        </div>
        <div>
            <label>Scenario</label>
            <input type='string' placeholder='My amazing scenario' value={scenario} onChange={e => setScenario(e.target.value)} list='scenario-suggestions' />
            <datalist id='scenario-suggestions'>
                {possibleScenarios?.map(val => <option value={val} />)}
            </datalist>
        </div>

        <input type='submit' onClick={submit} disabled={feature === undefined || scenario === undefined || !conflictsResolved} />

        <Editor onChange={(e) => setFeatureSource(e)} language={DIFF_LANGUAGE} value={source} width={window.screen.availWidth / 2} height={window.screen.availHeight / 2} />

        <FaTimesCircle style={{ position: 'fixed', right: 0, top: 0, padding: '5px', fontSize: '150%', cursor: 'pointer' }} onClick={close} />
    </div>
}