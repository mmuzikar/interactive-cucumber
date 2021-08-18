import React from 'react';
import './App.css';
import { CucumberContext, CucumberContextType } from './data/CucumberContext';
import { useAsync, useAsyncRetry } from 'react-use';
import { InputEditor } from './components/InputEditor';
import { Log } from './components/Log';
import { Toolbox } from './components/Toolbox';
import GridLayout from 'react-grid-layout';
import "react-grid-layout/css/styles.css";
import 'react-resizable/css/styles.css';
import useWindowDimensions from './hooks/WindowDimensions';
import { Output } from './components/Output';
import { AlertProviderProps, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic'

const layout: GridLayout.Layout[] = [
  { i: 'input', x: 0, y: 0, w: 7, h: 2 },
  { i: 'output', x: 7, y: 0, w: 3, h: 2 },
  { i: 'log', x: 0, y: 2, w: 12, h: 1 },
  { i: 'toolbox', x: 10, y: 0, w: 2, h: 2 }
]

export const App = () => {

  const context = useAsyncRetry(CucumberContextType.create)

  const { width, height } = useWindowDimensions()

  let content = <h1>Loading</h1>

  if (context.error) {
    content = <div>
      <h1>Something wrong happened</h1>
      <strong>{context.error.name}</strong>
      <p>{context.error.message}</p>
      <p>Please check your testsuite, is it running? Have you tried turning it off and on?</p>
      <a onClick={() => context.retry()} href="javascript:void(0)">Reload</a>
    </div>;
  } else if (context.value) {
    content = <CucumberContext.Provider value={context.value}>
      <GridLayout layout={layout} className="layout" cols={12} width={width} rowHeight={(height - 50) / 3}>
        <div key='input'><InputEditor /></div>
        <div key='output'><Output /></div>
        <div key='log'><Log /></div>
        <div key='toolbox'><Toolbox /></div>
      </GridLayout>
    </CucumberContext.Provider>

  }

  return <div className="App">
    <AlertProvider template={AlertTemplate} timeout={5000} position='top center' transition='fade'>
      {content}
    </AlertProvider>
  </div>
    ;
};
