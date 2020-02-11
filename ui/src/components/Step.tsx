import React, { Component } from "react";
import { Step as CStep } from "../interop/cucumberTypes";

export class Step extends Component<CStep> {
    
    render() {
        return <div>
            {this.props.pattern}
        </div>
    }
}