import React, { Component, ChangeEvent } from "react";
import { IStep as CStep } from "../interop/cucumberTypes";
import { Step } from "./Step";
import { Loading } from "./Loading";
import { StepManager } from "../interop/stepManager";
import Fuse from "fuse.js";

type StepState = {
    steps: CStep[],
    search: string
}

//The step list used for searching in step definitions
export class StepList extends Component<{},StepState> {

    constructor(props:any){
        super(props);
        this.filter = this.filter.bind(this);
    }

    searchOptions : Fuse.FuseOptions<CStep> = {
        shouldSort: true,
        distance: 100,
        minMatchCharLength: 1,
        keys: [
            {
                name: "pattern",
                weight: 0.6 
            }, {
                name: "docs",
                weight: 0.2
            }, {
                name: "location",
                weight: 0.2
            }
        ]
    }

    componentDidMount(){
        StepManager.get().getSteps().then((steps) => this.setState({steps: steps.map(step => step.toIStep())}));
    }

    filter(e:ChangeEvent<HTMLInputElement>){
        this.setState({search: e.target.value});
    }

    render(){
        if (this.state){
            let steps = this.state.steps;
            if (this.state.search){
                const fuse = new Fuse<CStep, Fuse.FuseOptions<CStep>>(this.state.steps, this.searchOptions);
                steps = fuse.search(this.state.search) as CStep[];
            }
            return (<div style={{paddingRight: "10px", height: 'inherit'}}>
                <h3>Step list</h3>
                <input onChange={this.filter} placeholder="Filter" style={{width: "100%"}}/>
                <ul style={{height: '80%', overflowY: 'scroll'}}>
                    {
                        steps.length != 0 ? 
                            steps.map((val : CStep, i : number) => <Step {...val} key={`step_${i}`}/>)
                            : <b>No steps found</b>
                    }
                </ul>
            </div>);

        } else {
            return <Loading/>
        }
    }
}