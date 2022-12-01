import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Alert } from '@mui/material';
import { useState } from 'react';

function Login() {

    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    const [error, setError] = useState<null | string>(null);

    return <Box
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
                fullWidth
                variant="contained"
                onClick={() => {
                    signInWithPopup(auth, provider).catch((err)=>{
                        setError(err.message)
                    });
                }}
                sx={{ mt: 3, mb: 2 }}
            >
                Sign In With Google
            </Button>
        </Box>
        {error ?  <Alert onClose={()=>{setError(null)}} severity="error">{error}</Alert> : <></>}
       
    </Box>
}

export default Login