import React, { Component } from "react";
import Fuse, { FuseOptions } from "fuse.js";
import { keyDispatcher } from "./TerminalInput";

type Props<T> = {
    value: string,
    show: boolean,
    getData: () => Promise<T[]>,
    toggleSending: (arg0:boolean) => void,
    fillIn: (arg0:T) => void,
    render: (arg0:T) => JSX.Element
};
type State<T> = {
    data: T[],
    currentIndex: number
};

export class CompletePrompt<T> extends Component<Props<T>, State<T>> {

    fuseOptions : FuseOptions<T> = {
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
        data: [],
        currentIndex: -1
    }

    componentDidMount(){
        const outOfRange = () => this.state.currentIndex === -1 || this.state.currentIndex === this.state.data.length;
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
                        currentIndex: Math.min(prevState.currentIndex+1, prevState.data.length)
                    }))
                }
            } else if (event.key === "ArrowUp"){
                if (outOfRange()){
                    this.setState({
                        currentIndex: this.state.data.length - 1
                    })
                } else {
                    this.setState((prevState) => ({
                        currentIndex: Math.max(prevState.currentIndex-1, -1)
                    }))
                }
            } else if (event.key === "Enter"){
                if (!outOfRange()){
                    this.props.fillIn((this.state.data[this.state.currentIndex] as T));
                }
            }
            this.props.toggleSending(outOfRange());
        })
    }

    componentDidUpdate(prevProps:Props<T>){
        if (this.props.value !== prevProps.value){
            this.props.getData().then(val => {
                if (val){
                    const fuse = new Fuse(val, this.fuseOptions);
                    const results = fuse.search(this.props.value);
                    this.setState({
                        data: results as T[],
                        currentIndex: -1
                    });
                }
            })
        }
    }

    render(){
        const offset = (this.state.data.length * 20);
        if (!this.props.show){
            return <></>;
        }
        return <ul className="complete-prompt" style={{top: -offset}}>
            {(this.state.data||[]).map((val:T, i) => 
                <CompleteEntry<T> setActive={(active) => {
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
                value={val} 
                key={`complete_${i}`}
                render={this.props.render}
                fillIn={() => this.props.fillIn((this.state.data[this.state.currentIndex] as T))}
                />)}
        </ul>;
    }
}

class CompleteEntry<T> extends Component<{active: boolean, render: (arg0:T) => JSX.Element, value:T, setActive: (arg0:boolean) => void, fillIn: () => void}> {

    render(){
        return <li className={this.props.active?"complete-prompt-entry-active":""} 
            onMouseEnter={() => this.props.setActive(true)} 
            onMouseLeave={() => this.props.setActive(false)}
            onClick={this.props.fillIn}>
            {this.props.render(this.props.value)}
        </li>
    }

}