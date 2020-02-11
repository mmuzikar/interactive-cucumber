import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';
import {  } from "react-grid-layout";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import { StepList } from './components/StepList';
import { TerminalInput } from './components/TerminalInput';
import { History } from './components/History';
import { Editor } from './components/Editor';

const ReactGridLayout = WidthProvider(RGL);
const layout : Layout[] = [
  {i: "history", x: 0, y: 0, w: 8, h: 8},
  {i: "step-list", x: 8, y:0, w: 2, h: 5},
  {i: "terminal", x: 0, y: 8, w: 8, h: 1},
  {i: "toolbox", x:8, y:5, w: 2, h:4}
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
          <div key="history"><a href="#" onClick={() => this.setState({editor: !this.state.editor})}>Edit</a>
            {this.state.editor?<Editor/>:<History />}</div>
          <div key="terminal"><TerminalInput /></div>
          <div key="step-list"><StepList /></div>
          <div key="toolbox">TODO: add toolbox (favorites {"&"} macros)</div>
        </ReactGridLayout>
      </div>
    );
  }
}


export default App;
