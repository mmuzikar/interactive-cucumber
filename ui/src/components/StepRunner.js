import React from "react";
import { setStepDispatcher } from "../App";
import { AutoComplete, message } from "antd";
import Fuse from "fuse.js";

class StepRunner extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            step: undefined,
            params: [],
            suggestions: {}
        };
        this.onStepChange = this.onStepChange.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.execStep = this.execStep.bind(this);
        this.fetchSuggestions = this.fetchSuggestions.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    onStepChange(val){
        this.setState({
            step: val,
            params: [],
            suggestions: {}
        });
        val.args.forEach((arg, i) => {
            if (arg.suggProvider){
                this.fetchSuggestions(val.pattern, i);
            }
        });
    }

    fetchSuggestions(step, i){
        const body = {
            step: step,
            args: this.state.params,
            argId: i
        };
        fetch('/suggestion', {
            method: "POST",
            body: JSON.stringify(body)
        }).then(res => { console.log(res); return res.json()}).then((data) => {
            console.log(data);
            const options = data.map((val) => ({value: val, show: true}));
            this.setState((oldS) => {
                let newS = oldS;
                newS.suggestions[i] = {};
                newS.suggestions[i] = options;
                console.log(newS);
                return newS
            });
        });
        console.log(`fetching suggestions for ${JSON.stringify(body)}`)
    }

    componentDidMount(){
        setStepDispatcher.register(this.onStepChange);   
    }

    onInputChange(name, val){
        let newParams = this.state.params;
        newParams[name] = val;
        this.setState({
            params: newParams
        });
    }

    execStep(e){
        let param = 1;
        const repl = this.state.step.pattern.replace(/\([^\)]*\)/gi, (x) => this.state.params[param++]);
        console.log(`Sending ${repl}`);
        const resp = fetch("/runstep", {
            method: "POST",
            body: repl
        }).then((resp) => !resp.ok?message.error(`There was an error when running the step`):message.info(`Step complete`));
        e.preventDefault();
    }

    handleSearch(text, i){
      i = 0;
      console.log(`Filtering for ${i}`)
      let fuse = new Fuse(this.state.suggestions[i], {keys: ['value']});
      console.log(fuse);
      console.log(fuse.search(text));
    }

    render(){
        if (this.state.step){
            let param = 0;
            const repl = this.state.step.pattern.replace(/\([^\)]*\)/gi, (x) => `$${param++}$`);
            const split = repl.split(/\$/);
            param = 0;
            const {Option} = AutoComplete;
            const elems = split.map((val, i) => {
              if (/\d+/.test(val)){
                console.log(this.state.suggestions[param]);
                const options = (this.state.suggestions[param] || []).map((s, si) => <Option key={`sugg${i}${si}`} value={s.value}>{s.value}</Option>);
                return (<AutoComplete filterOption={true} style={{display: "inline-block", width: "auto"}} onChange={ val => this.onInputChange.bind(this)(param, val)} key={param} name={param++} type="string">
                  {options}
                </AutoComplete>);
              } else {
                return <span key={`desc${i}`}>{val}</span>
              }
            });
            return (<div><form>{elems}<button type="submit" onClick={this.execStep}>Run</button></form></div>)
        }
        return <div></div>
    }

}

export default StepRunner;