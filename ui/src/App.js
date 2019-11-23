import React from 'react';
import logo from './logo.svg';
import './App.css';
import StepList from './components/StepList';
import StepRunner from './components/StepRunner';
import {Dispatcher} from "flux";
import { Layout, Divider } from "antd";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css"
import 'antd/dist/antd.css';

const { Header, Sider, Content, Footer } = Layout;

export const setStepDispatcher = new Dispatcher();

function App() {
  return (
    <Layout style={{height: '100vh'}}>
      <Sider>
        TODO
      </Sider>
      <Content>
        <StepRunner/>
      </Content>
      <ResizableBox width={350} minConstraints={[100, 100]} height={200} resizeHandles={['w']}>
        <StepList/>
      </ResizableBox>
      
    </Layout>
  );
}

export default App;
