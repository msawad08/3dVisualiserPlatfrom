import React from 'react';
import { Visualiser } from '../visualiser/Visualiser';
import './App.css';
import { Configurator } from '../configurator/configurator';

function App() {
  return (
    <div className="App">
        <Visualiser />
        <Configurator/>
    
    </div>
  );
}

export default App;
