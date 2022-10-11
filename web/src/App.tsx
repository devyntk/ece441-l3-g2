import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


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
  const provider = new GoogleAuthProvider();
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
            setLoggedin(false);
          }}>Signout</button>
        </header>
      </div>
    );
  } else {
    // No user is signed in.
    return (
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={() => {
              signInWithPopup(auth, provider);
            }}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In With Google
          </Button>
        </Box>
      </Box>
    );
  }

}

export default App;
