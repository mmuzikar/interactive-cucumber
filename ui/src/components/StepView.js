import React from "react"
import { setStepDispatcher } from "../App";


class StepView extends React.Component {

    constructor(props){
        super(props);
    }

    render(){
        return(
            <div>
                {this.props.pattern}
                <button onClick={() => setStepDispatcher.dispatch(this.props)}>Run this</button>
            </div>
        )
    }
}

export default StepView;