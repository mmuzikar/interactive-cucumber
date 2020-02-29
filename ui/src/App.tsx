import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import { StepList } from './components/StepList';
import { InputEditor } from './components/InputEditor';
import { OutputEditor } from './components/OutputEditor';
import { Logger } from './components/Log';
import { Toolbox } from './components/Toolbox';

const ReactGridLayout = WidthProvider(RGL);
const layout : Layout[] = [
  {i: "input-editor", x: 0, y: 0, w: 4, h: 6},
  {i: "output-editor", x: 4, y: 0, w: 4, h: 6},
  {i: "step-list", x: 8, y:0, w: 2, h: 5},
  {i: "toolbox", x:8, y:5, w: 2, h:4},
  {i: "log", x:0, y: 6, w: 8, h: 3}
]

type State = {
  editor: boolean
}


class App extends Component<{}, State> {

  state = {
    editor: false
  }

  render(){
    const rowHeight = (window.innerHeight-5)/10;
    const colWidth = (window.innerWidth)/10;
    return (
      <div className="App">
        <ReactGridLayout autoSize={true} isDraggable={false} className="layout" layout={layout} cols={10} rowHeight={rowHeight}>
          <div key="input-editor"><InputEditor rowHeight={rowHeight} colWidth={colWidth}/></div>
          <div key="output-editor"><OutputEditor rowHeight={rowHeight} colWidth={colWidth}/></div>
          <div key="step-list"><StepList /></div>
          <div key="toolbox"><Toolbox /></div>
          <div key="log" style={{marginTop: "10px"}}><Logger/></div>
        </ReactGridLayout>
      </div>
    );
  }
}


export default App;
