import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';
import {  } from "react-grid-layout";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import { StepList } from './components/StepList';
import { TerminalInput } from './components/TerminalInput';
import { InputEditor } from './components/InputEditor';
import { OutputEditor } from './components/OutputEditor';

const ReactGridLayout = WidthProvider(RGL);
const layout : Layout[] = [
  {i: "input-editor", x: 0, y: 0, w: 4, h: 7},
  {i: "output-editor", x: 4, y: 0, w: 4, h: 7},
  {i: "step-list", x: 8, y:0, w: 2, h: 5},
  {i: "toolbox", x:8, y:5, w: 2, h:4},
  {i: "log", x:0, y: 8, w: 8, h: 2}
]

type State = {
  editor: boolean
}


class App extends Component<{}, State> {

  state = {
    editor: false
  }

  render(){
    return (
      <div className="App">
        <ReactGridLayout autoSize={true} isDraggable={false} className="layout" layout={layout} cols={10} rowHeight={(window.innerHeight-5)/10}>
          <div key="input-editor"><InputEditor/></div>
          <div key="output-editor"><OutputEditor/></div>
          {/* <div key="history"><a href="#" onClick={() => this.setState({editor: !this.state.editor})}>Edit</a>
            {this.state.editor?<Editor/>:<History />}</div> */}
          {/* <div key="terminal"><TerminalInput /></div> */}
          <div key="step-list"><StepList /></div>
          <div key="toolbox">TODO: add toolbox (favorites {"&"} macros)</div>
          <div key="log"></div>
        </ReactGridLayout>
      </div>
    );
  }
}


export default App;
