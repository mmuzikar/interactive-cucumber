import React, { Component, ChangeEvent } from "react";
import { TerminalCompletePrompt } from "./TerminalCompletePrompt";
import { StepManager } from "../interop/stepManager";
import { Dispatcher } from "flux";
import { Step, Argument } from "../interop/cucumberTypes";

export const keyDispatcher = new Dispatcher<React.KeyboardEvent>();

type State = {
    val:string, 
    canSend:boolean, 
    stepRef?: Step,
    parsedInput: (string | number)[]
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
        parsedInput: []
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
                if (this.state.stepRef){
                    let i = 0;
                    let accum = 0;
                    const cursor = target.selectionStart;
                    for (let val of (this.state.parsedInput as string[])){
                        accum += val.length;
                        console.debug(`cursor: ${cursor} accum: ${accum} for val ${val}`);
                        if (cursor! <= accum){
                            break;
                        }
                        i++;
                    }
                    target.selectionStart = cursor;
                    console.log(`index: ${i} cursor: ${cursor}`);
                }
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
        let split = [];
        if (step && step.args){
            split.push(step.pattern.substring(0, step.args[0].start!));
            split.push(0);
            for (let i = 1; i < step.args.length; i++){
                split.push(step.pattern.substring(step.args[i-1].end! + 1, step.args[i].start!));
                split.push(i);
            }
            split.push(step.pattern.substring(step.args[step.args.length - 1].end! + 1));
        }
        this.setState({val: step ? step.pattern : "", parsedInput: split, stepRef: step}, () => {
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
        let val = this.state.parsedInput.length > 0 && false ? this.state.parsedInput.join("") : this.state.val;
        let input = <input id="terminal-input" style={{width: "85%"}} value={val} onInput={this.handleChange} onKeyDownCapture={this.handleInput}/>;
        if (this.state.parsedInput.length > 0){
            input = <div>
                {
                    this.state.parsedInput.map((val, i) => 
                        typeof(val) === "string" ? <span key={`const_${i}`}>{val}</span> : <input key={`var_${val}`} id={val}/>
                    )
                }
            </div>;
        }
        return <div style={{width: "100% "}}>
            <TerminalCompletePrompt value={this.state.val} 
                toggleSending={(arg) => this.setState({canSend: arg})}
                show={this.state.stepRef === undefined}
                fillIn={this.onSetStep}
            />
            {input}
            <input type="submit"/>
        </div>
    }

}