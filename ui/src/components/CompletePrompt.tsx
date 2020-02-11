import React, { Component } from "react";
import Fuse, { FuseOptions } from "fuse.js";
import { Step } from "../interop/cucumberTypes";
import { StepManager } from "../interop/stepManager";
import { keyDispatcher } from "./TerminalInput";

type Props = {
    value: string,
    show: boolean,
    toggleSending: (arg0:boolean) => void,
    fillIn: (arg0:Step) => void
};
type State = {
    steps: Step[],
    currentIndex: number
};

export class CompletePrompt extends Component<Props, State> {

    static fuseOptions : FuseOptions<Step> = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            {
                name: "pattern",
                weight: 0.7
            }, {
                name: "docs",
                weight: 0.3
            }
        ]
    }
    state = {
        steps: [],
        currentIndex: -1
    }

    componentDidMount(){
        const outOfRange = () => this.state.currentIndex === -1 || this.state.currentIndex === this.state.steps.length;
        keyDispatcher.register((event) => {
            if (!this.props.show){
                this.props.toggleSending(true);
                return;
            }
            if (event.key === "ArrowDown"){
                if (outOfRange()){
                    this.setState({
                        currentIndex: 0
                    });
                } else {
                    this.setState((prevState) => ({
                        currentIndex: Math.min(prevState.currentIndex+1, prevState.steps.length)
                    }))
                }
            } else if (event.key === "ArrowUp"){
                if (outOfRange()){
                    this.setState({
                        currentIndex: this.state.steps.length - 1
                    })
                } else {
                    this.setState((prevState) => ({
                        currentIndex: Math.max(prevState.currentIndex-1, -1)
                    }))
                }
            } else if (event.key === "Enter"){
                if (!outOfRange()){
                    this.props.fillIn((this.state.steps[this.state.currentIndex] as Step));
                }
            }
            this.props.toggleSending(outOfRange());
        })
    }

    componentDidUpdate(prevProps:Props){
        if (this.props.value !== prevProps.value){
            StepManager.get().getSteps().then((steps) => {
                if (steps){
                    const fuse = new Fuse(steps, CompletePrompt.fuseOptions);
                    const results = fuse.search(this.props.value);
                    this.setState({
                        steps: results as Step[],
                        currentIndex: -1
                    });
                }
            })
        }
    }

    render(){
        const offset = (this.state.steps.length * 20);
        if (!this.props.show){
            return <></>;
        }
        return <ul className="complete-prompt" style={{top: -offset}}>
            {(this.state.steps||[]).map((val:Step, i) => 
                <CompleteEntry setActive={(active) => {
                    if (active){
                        this.setState({
                            currentIndex: i
                        })
                    } else {
                        this.setState({
                            currentIndex: -1
                        })
                    }
                }} active={i === this.state.currentIndex} 
                step={val} 
                key={`complete_${i}`}
                fillIn={() => this.props.fillIn((this.state.steps[this.state.currentIndex] as Step))}
                />)}
        </ul>;
    }
}

class CompleteEntry extends Component<{active: boolean, step:Step, setActive: (arg0:boolean) => void, fillIn: () => void}> {

    render(){
        return <li className={this.props.active?"complete-prompt-entry-active":""} 
            onMouseEnter={() => this.props.setActive(true)} 
            onMouseLeave={() => this.props.setActive(false)}
            onClick={this.props.fillIn}>
            {this.props.step.pattern}
        </li>
    }

}