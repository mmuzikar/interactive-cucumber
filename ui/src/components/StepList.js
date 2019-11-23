import React from "react"
import { getBaseUrl } from "../Config";
import StepView from "./StepView";

import InfiniteScroll from "react-infinite-scroller";
import { List, Button } from "antd";
import { setStepDispatcher } from "../App";

class StepList extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            steps: undefined
        };
    }

    componentDidMount(){
        this.fetchData();
    }

    async fetchData(){
        const resp = await fetch(`${getBaseUrl()}/liststeps`);
        let data = await resp.json();
        data.forEach(el => el.pattern = el.pattern.replace(/\"/, '"'));
        console.log(data);
        this.setState({steps: data});
    }

    render(){
        let i = 0;
        return (
        <List dataSource={this.state.steps} renderItem={item => (
                <List.Item key={i++}>{item.pattern} <Button onClick={() => setStepDispatcher.dispatch(item)}>Run</Button></List.Item>
            )}>
        </List>
        );
    }

}

export default StepList;