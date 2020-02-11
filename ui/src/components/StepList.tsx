import React, { Component } from "react";
import { Step as CStep } from "../interop/cucumberTypes";
import { AppConfig } from "../interop/config";
import { Step } from "./Step";
import { Loading } from "./Loading";
import { StepManager } from "../interop/stepManager";

type StepState = {
    steps: CStep[]
}

export class StepList extends Component<{},StepState> {

    componentDidMount(){
        StepManager.get().getSteps().then((steps) => this.setState({steps: steps}));
    }

    render(){
        if (this.state){
            return (<ul>
                {this.state.steps.map((val, i) => <Step {...val} key={`step_${i}`}/>)}
                </ul>);
        } else {
            return <Loading/>
        }
    }
}