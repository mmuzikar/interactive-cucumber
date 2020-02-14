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

    handleSubmit(target:HTMLElement){
        console.debug(target);
        let stepBuild = '';
        for (let i = 0; i < target.children.length; i++){
            const item = target.children.item(i);
            if (item instanceof HTMLInputElement){
                stepBuild += item.value;
            } else {
                stepBuild += (item as HTMLElement).textContent;
            }
        }
        StepManager.get().runStep(stepBuild);
        this.setState({
            parsedInput: [],
            stepRef: undefined
        });
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
                    this.handleSubmit(document.getElementById("terminal-input")!);
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
            case "Escape":
                input.preventDefault();
                this.setState({
                    parsedInput: [],
                    stepRef: undefined
                });
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
                const firstInput = document.getElementById('arg-0') as HTMLInputElement;
                if (firstInput){
                    firstInput.focus();
                }
            }
        });
    }

    render(){
        let val = this.state.parsedInput.length > 0 && false ? this.state.parsedInput.join("") : this.state.val;
        let input = <input autoFocus id="terminal-input" style={{width: "85%"}} value={val} onInput={this.handleChange} onKeyDownCapture={this.handleInput}/>;
        if (this.state.parsedInput.length > 0){
            input = <div id="terminal-input" onKeyDownCapture={this.handleInput}>
                {
                    this.state.parsedInput.map((val, i) => 
                        typeof(val) === "string" ? <span key={`const_${i}`}>{val}</span> : <input onKeyPress={(event) => {
                            if (event.key === "Enter"){
                                this.handleSubmit(document.getElementById("terminal-input") as HTMLInputElement);
                            }
                        }} key={`var_${val}`} className='arg' id={`arg-${i}`}
                        autoFocus={val === 0}
                        />
                    )
                }
            </div>;
        }
        return <div style={{width: "100% "}}>
            <CompletePrompt<Step> value={this.state.val} 
                toggleSending={(arg) => this.setState({canSend: arg})}
                show={this.state.stepRef === undefined}
                fillIn={this.onSetStep}
                getData={() => StepManager.get().getSteps()}
                render={(step) => <span>{step.pattern}</span>}
            />
            {input}
            <input type="submit"/>
        </div>
    }

}