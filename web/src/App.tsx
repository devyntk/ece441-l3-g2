import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import Login from './Login';



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
  const auth = getAuth(app);

  const [loggedIn, setLoggedin] = useState(false);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      setLoggedin(true);
    } else {
      // User is signed out
      setLoggedin(false);
    }
  });


  if (loggedIn) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Welcome!
          </p>
          <button onClick={() => {
            signOut(auth);
          }}>Signout</button>
        </header>
      </div>
    );
  } else {
    // No user is signed in.
    return (
      <Login />
    );
  }

}

export default App;
