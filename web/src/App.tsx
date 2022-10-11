import React from 'react';
import logo from './logo.svg';
import './App.css';

import { initializeApp } from 'firebase/app';
import { auth } from 'firebaseui';


function App() {

  // TODO: Replace the following with your app's Firebase project configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDAK-NEM2_3wgC29Jmz2NwL9KzHd7xvm8I",
    authDomain: "ece441-portapotty.firebaseapp.com",
    projectId: "ece441-portapotty",
    storageBucket: "ece441-portapotty.appspot.com",
    messagingSenderId: "639113120829",
    appId: "1:639113120829:web:0397fe230af6510a472e54",
    measurementId: "G-76L6LKH6W6"
  };


  const app = initializeApp(firebaseConfig);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
