import { useContext, useEffect, useState } from "react"
import { CucumberContext, Feature } from "../data/CucumberContext"
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css"
import ReactList from "react-list";
import { useMeasure } from "react-use";
import ReactTooltip, { GetContent } from "react-tooltip";
import Fuse from "fuse.js";

const adjustToParent: React.CSSProperties = { height: "100%", display: 'block', marginBottom: '0px' }

export const Toolbox = () => {

    const cucumber = useContext(CucumberContext)
    const [Measure, { height }] = useMeasure()
    const [stepSearchValue, setStepSearchValue] = useState('')
    const [featureSearchValue, setFeatureSearchValue] = useState('')

    const [stepDefs, setStepDefs] = useState(cucumber.stepDefs)
    const [features, setFeatures] = useState(cucumber.features)

    const featureSearch = new Fuse<Feature>(cucumber.features, {
        shouldSort: true,
        keys: ['source'],
        ignoreLocation: true
    })


    useEffect(() => {
        if (stepSearchValue.length > 0) {
            setStepDefs(cucumber.findSteps(stepSearchValue).map(res => res.item))
        } else {
            setStepDefs(cucumber.stepDefs)
        }
        setTimeout(() => {
            //UseEffect sometimes gets called before the DOM is updated and ReactTooltip doesn't recognize all tooltip elements
            ReactTooltip.rebuild()
        }, 100);
    }, [stepSearchValue, cucumber])

    useEffect(() => {
        if (featureSearchValue.length > 0) {
            console.log(featureSearch.search(featureSearchValue))
            setFeatures(featureSearch.search(featureSearchValue).map(val => val.item))
        } else {
            setFeatures(cucumber.features)
        }
        setTimeout(() => {
            //UseEffect sometimes gets called before the DOM is updated and ReactTooltip doesn't recognize all tooltip elements
            ReactTooltip.rebuild()
        }, 100);
    }, [featureSearchValue, cucumber])


    useEffect(() => {
        ReactTooltip.rebuild()
    })

    const renderStepDef = (i: number, key: string | number) => {
        return (
            <div key={`stepdef-${i}`} data-for='stepdefs-tooltip' data-tip={i}>{stepDefs[i].getPatternWithoutControlChars()}</div>
        )
    }

    const renderFeature = (i: number, _: string | number) => (
        <div key={`feature-${i}`}>
            <strong>{features[i].name}</strong>
            <ul>
                {features[i].scenarios?.map((sc, j) => <li key={`scenario-${i}-${j}`} data-for='feature-tooltip' data-tip={i + '-' + j} className='clickable' onClick={() => {
                    if (cucumber.setEditorContent) {
                        cucumber.setEditorContent(sc.getScenarioText())
                        cucumber.currentScenario.featureId = features[i].uri
                    }
                }}>{sc.name}</li>)}
            </ul>
        </div>
    )

    const renderStepDefTooltip: GetContent = (dataTip) => {
        const stepDef = stepDefs[Number(dataTip)]
        if (stepDef === undefined) {
            return
        }
        return (<div>
            <h2>{stepDef.getPatternWithoutControlChars()}</h2>
            {stepDef.docs ? <><strong>Docs</strong>
                <div style={{ maxHeight: '20vh', overflowY: 'auto' }}>
                    {stepDef.docs}
                </div></> : <></>}
            {stepDef.arguments.length > 0 ? <>
                <strong>Arguments:</strong>
                <ol>
                    {stepDef.arguments.map((arg, i) => (<li key={`tooltip-arg-${i}`}>{arg.type}{arg.suggProvider.length > 0 ? <i> - {arg.suggProvider}</i> : <></>}</li>))}
                </ol>
            </> : <></>}

            <strong>Location: {'todo'}</strong>

        </div>)
    }

    const renderScenarioToolTip: GetContent = (datatip) => {
        if (!datatip) {
            return <></>
        }
        const [i, j] = datatip.split('-').map(Number)
        if (features[i]?.scenarios) {
            const scenario = features[i].scenarios![j]
            if (scenario === undefined) {
                return
            }
            return <div>
                {scenario.name}
                <pre style={{ maxHeight: '20vh', overflowY: 'auto' }}>
                    {scenario.getScenarioText()}
                </pre>
            </div>
        }

    }

    return (<div className='grid-item' ref={(el) => Measure(el as Element)}>
        <Tabs style={adjustToParent} onSelect={index => { setTimeout(() => ReactTooltip.rebuild(), 100) }}>
            <TabList>
                <Tab>Step list</Tab>
                <Tab>Scenarios</Tab>
            </TabList>
            <TabPanel>
                <input onChange={(val) => setStepSearchValue(val.target.value.trim())}></input>
                <div onScroll={ReactTooltip.rebuild} style={{ overflow: 'auto', maxHeight: `${height - 100}px` }}>
                    <ReactList length={stepDefs.length} itemRenderer={renderStepDef} />
                </div>
                <ReactTooltip id='stepdefs-tooltip' effect='solid' isCapture={true} clickable={true} multiline={true} getContent={renderStepDefTooltip} />
            </TabPanel>
            <TabPanel >
                <input onChange={(val) => setFeatureSearchValue(val.target.value.trim())}></input>
                <div onScroll={ReactTooltip.rebuild} style={{ overflow: 'auto', maxHeight: `${height - 50}px` }}>
                    <ReactList length={features.length} itemRenderer={renderFeature} />
                </div>
                <ReactTooltip id='feature-tooltip' effect='solid' isCapture={true} clickable={true} multiline={true} getContent={renderScenarioToolTip} />
            </TabPanel>
        </Tabs>
    </div>)
}