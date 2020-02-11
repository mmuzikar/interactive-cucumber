import React, { Component, ChangeEvent } from "react";
import { CompletePrompt } from "./CompletePrompt";
import { StepManager } from "../interop/stepManager";
import { Dispatcher } from "flux";
import { Step, Argument } from "../interop/cucumberTypes";

export const keyDispatcher = new Dispatcher<React.KeyboardEvent>();

type State = {
    val:string, 
    canSend:boolean, 
    stepRef?: Step,
};

export class TerminalInput extends Component<{}, State> {

    constructor(props:any){
        super(props);
        this.handleInput = this.handleInput.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSetStep = this.onSetStep.bind(this);
        this.getStepRef = this.getStepRef.bind(this);
    }

    state = {
        val: "",
        canSend: true,
        stepRef: undefined,
    }

    handleSubmit(input:HTMLInputElement){
        StepManager.get().runStep(input.value);
    }

    getStepRef(){
        return this.state.stepRef! as Step;
    }

    handleInput(input:React.KeyboardEvent<HTMLInputElement>){
        const target = input.target as HTMLInputElement;
        switch(input.key){
            case "Enter":
                input.preventDefault();
                if (this.state.stepRef !== undefined && this.state.val.length > 0){
                    this.handleSubmit(target);
                //TODO: if user is pressing Enter repeatedly tell them they need to use Shift
                } else if (input.shiftKey){
                    this.handleSubmit(target);
                }
            break;
            case "Tab":
                input.preventDefault();
                if (this.state.stepRef && this.state.stepRef !== undefined && this.getStepRef().args){
                    let offset = this.state.val.length - this.getStepRef().pattern.length;
                    //TODO: ugh
                    let i = 0;
                    const args = this.getStepRef().args as Argument[];
                    while(target.selectionStart! < args[i].start!){
                        i++;
                        if (i > args.length){
                            i = 0;
                            break;
                        }
                    }
                }
                break;
            default:

            break;
        }
        keyDispatcher.dispatch(input);
    }

    handleChange(input:ChangeEvent<HTMLInputElement>){
        const newVal = input.target.value;
        this.setState({
            val: input.target.value
        });
        if (newVal === ""){
            this.setState({
                stepRef: undefined
            })
        }
    }

    onSetStep(step: Step){
        this.setState({val: step ? step.pattern : "", stepRef: step}, () => {
            if (step && step.args){
                const input = document.getElementById("terminal-input") as HTMLInputElement;
                if (input){
                    input.focus();
                    input.setSelectionRange(step.args[0].start!, step.args[0].end! + 1);
                }
            }
        });
    }

    render(){
        return <div style={{width: "100% "}}>
            <CompletePrompt value={this.state.val} 
                toggleSending={(arg) => this.setState({canSend: arg})}
                show={this.state.stepRef === undefined}
                fillIn={this.onSetStep}
            />
            <input id="terminal-input" style={{width: "85%"}} value={this.state.val} onChange={this.handleChange} onKeyDownCapture={this.handleInput}/>
            <input type="submit"/>
        </div>
    }

}