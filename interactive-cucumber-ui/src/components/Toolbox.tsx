import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react"
import { CucumberContext } from "../data/CucumberContext"
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css"
import ReactList from "react-list";
import { useMeasure } from "react-use";
import ReactTooltip, { GetContent } from "react-tooltip";
import Fuse from "fuse.js";
import { StepDefinition } from "../data/cucumber/StepDefinition";
import { Feature } from "../data/cucumber/Feature";

const adjustToParent: React.CSSProperties = { height: "100%", display: 'block', marginBottom: '0px' }

type SearchBarProps = {
    setStepSearchValue : (val:string) => void
}

const SearchBar = ({setStepSearchValue} : SearchBarProps) => <input className='searchBar' onChange={(val) => setStepSearchValue(val.target.value.trim())} placeholder='Search...' />

export const Toolbox = () => {

    const [Measure, { height }] = useMeasure()


    useEffect(() => {
        ReactTooltip.rebuild()
    })


    return (<div className='grid-item' ref={(el) => Measure(el as Element)}>
        <Tabs style={adjustToParent} onSelect={index => { setTimeout(() => ReactTooltip.rebuild(), 100) }}>
            <TabList>
                <Tab>Step definitions</Tab>
                <Tab>Scenarios</Tab>
            </TabList>
            <TabPanel>
                <StepDefPanel height={height} />
            </TabPanel>
            <TabPanel>
                <FeaturesPanel height={height} />
            </TabPanel>
        </Tabs>
    </div>)
}

type PanelProps = {
    height: number
}

type GroupingMode = 'None' | 'Tags' | 'Classes'

const StepDefPanel = ({ height }: PanelProps) => {
    const cucumber = useContext(CucumberContext)

    const [groupingMode, setGroupingMode] = useState<GroupingMode>('None')

    const [stepSearchValue, setStepSearchValue] = useState('')
    const [stepDefs, setStepDefs] = useState(cucumber.stepDefs)

    const groupedStepDefs = useMemo(() => {
        return stepDefs.reduce((acc, value) => {
            if (groupingMode === 'Tags') {
                const tags = value.tags

                if (tags.length > 0) {
                    tags.forEach((tag) => {
                        if (!acc[tag]) {
                            acc[tag] = []
                        }

                        acc[tag].push(value)
                    })
                } else {
                    acc['untagged'].push(value)
                }
            } else if (groupingMode === 'Classes') {
                const loc = value.location?.className || "untagged";

                if (!acc[loc]) {
                    acc[loc] = []
                }

                acc[loc].push(value)
            }

            if (acc['untagged']?.length === 0) {
                delete acc['untagged']
            }

            return acc
        }, { "untagged": [] } as Record<string, StepDefinition[]>)
    }, [stepDefs, groupingMode]);

    const stepDefGroups = useMemo(() => Object.keys(groupedStepDefs), [groupedStepDefs])

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
    }, [stepSearchValue, cucumber, groupingMode])

    const renderStepDef = (i: number, key: string | number) => {
        return (
            <li key={`stepdef-ungrouped-${i}`} data-for='stepdefs-tooltip' data-tip={i}>{stepDefs[i].getPatternWithoutControlChars()}</li>
        )
    }

    const stepDefToolTip = (stepDef: StepDefinition) => (
        <div>
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
            {stepDef.location ?
                <strong>Location: {stepDef.location.className}#{stepDef.location.methodName}</strong>
                : <></>}
        </div>
    )

    const renderStepDefTooltip: GetContent = (dataTip) => {
        const stepDef = stepDefs[Number(dataTip)]
        if (stepDef === undefined) {
            return <></>
        }

        return stepDefToolTip(stepDef)
    }

    const renderGroupedStepDefToolTip: GetContent = (datatip) => {
        if (!datatip || !groupedStepDefs) {
            return <></>
        }
        const [i, j] = datatip.split('-').map(Number)
        const stepDef = groupedStepDefs[stepDefGroups[i]][j]
        if (stepDef === undefined) {
            return <></>
        }
        return stepDefToolTip(stepDef)
    }

    const renderStepDefGroup = (i: number, _: string | number) => (
        <div>
            <strong>{stepDefGroups[i]}</strong>
            <ul>
                {
                    groupedStepDefs[stepDefGroups[i]].map((val, j) => (<li key={`stepdef-${groupingMode}-${i}-${j}`} data-for='stepdefs-tooltip' data-tip={`${i}-${j}`}>{val.getPatternWithoutControlChars()}</li>))
                }
            </ul>
        </div>
    )

    const groupingEventHandler = (val: ChangeEvent<HTMLInputElement>) => setGroupingMode(val.target.value as GroupingMode)


    return <>
        <div>
            <SearchBar setStepSearchValue={setStepSearchValue}/>
            <hr />
        </div>
        <div>
            <strong>Grouping mode</strong><br />
            <input onChange={groupingEventHandler} type='radio' value='None' name='None' checked={groupingMode === 'None'} /><label htmlFor='None'>None</label>
            <input onChange={groupingEventHandler} type='radio' value='Tags' name='Tags' checked={groupingMode === 'Tags'} /><label htmlFor='Tags'>Tags</label>
            <input onChange={groupingEventHandler} type='radio' value='Classes' name='Classes' checked={groupingMode === 'Classes'} /><label htmlFor='Classes'>Classes</label>
        </div>
        <div onScroll={ReactTooltip.rebuild} style={{ overflow: 'auto', maxHeight: `${height - 125}px` }}>
            {
                groupingMode === 'None' ?
                    <ul><ReactList length={stepDefs.length} itemRenderer={renderStepDef} /></ul> :
                    <ReactList length={stepDefGroups.length} itemRenderer={renderStepDefGroup}/>

            }
        </div>
        <ReactTooltip id='stepdefs-tooltip' effect='solid' isCapture={true} clickable={true} multiline={true} getContent={groupingMode === 'None' ? renderStepDefTooltip : renderGroupedStepDefToolTip} />
    </>
}


const FeaturesPanel = ({ height }: PanelProps) => {
    const cucumber = useContext(CucumberContext)

    const [featureSearchValue, setFeatureSearchValue] = useState('')
    const [features, setFeatures] = useState(cucumber.features)

    const featureSearch = new Fuse<Feature>(cucumber.features, {
        shouldSort: true,
        keys: ['source'],
        ignoreLocation: true
    })

    useEffect(() => {
        if (featureSearchValue.length > 0) {
            setFeatures(featureSearch.search(featureSearchValue).map(val => val.item))
        } else {
            setFeatures(cucumber.features)
        }
        setTimeout(() => {
            //UseEffect sometimes gets called before the DOM is updated and ReactTooltip doesn't recognize all tooltip elements
            ReactTooltip.rebuild()
        }, 100);
    }, [featureSearchValue, cucumber])

    const renderFeature = (i: number, _: string | number) => (
        <div key={`feature-${i}`}>
            <strong>{features[i].name}</strong>
            <ul>
                {features[i].scenarios?.map((sc, j) => <li key={`scenario-${i}-${j}`} data-for='feature-tooltip' data-tip={i + '-' + j} className='clickable' onClick={() => {
                    if (cucumber.setEditorContent) {
                        cucumber.setEditorContent(sc.getScenarioText())
                    }
                }}>{sc.name}</li>)}
            </ul>
        </div>
    )

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

    return (<>
        <SearchBar setStepSearchValue={setFeatureSearchValue}/>
        <div onScroll={ReactTooltip.rebuild} style={{ overflow: 'auto', maxHeight: `${height - 50}px` }}>
            <ReactList length={features.length} itemRenderer={renderFeature} />
        </div>
        <ReactTooltip id='feature-tooltip' effect='solid' isCapture={true} clickable={true} multiline={true} getContent={renderScenarioToolTip} />
    </>)

}