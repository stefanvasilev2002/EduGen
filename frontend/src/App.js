// src/App.js
import React from 'react';
import TestConnection from './components/test/TestConnection';
import './App.css';

function App() {
  return (
      <div className="App">
        <header className="App-header">
          <h1>EduGen</h1>
          <TestConnection />
        </header>
      </div>
  );
}

export default App;