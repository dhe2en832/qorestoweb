import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockOpen from '@mui/icons-material/LockOpen';
import { useAuth } from '../../contexts/AuthContext';
import CompanyName from '../../components/CompanyName';
import AlertContainer from '../../components/AlertContainer';

function Login({ isForm, afterLogin }) {
  const styles = {
    root: {
      padding: '16px',
    },
    margin: {
      margin: '8px',
    },
  };
  const [state, setState] = useState({ cuserid: '', cpassw: '' });
  const handleChange = (event) => {
    setState((prevState) => {
      return { ...prevState, [event.target.id]: event.target.value };
    });
  };

  let auth = useAuth();
  let history = useHistory();
  let location = useLocation();
  let { from } = location.state || { from: { pathname: '/' } };
  let login = (event) => {
    event.preventDefault();
    auth.signin(state, () => (isForm ? afterLogin() : history.replace(from)), isForm);
  };

  return (
    <>
      {isForm && <AlertContainer idElem={'LoginForm'} />}
      <Container maxWidth="sm" sx={styles.root}>
        <Grid container spacing={1} justifyContent="center" alignItems="center" direction="column">
          {!isForm && (
            <Grid item xs={12} mb={5}>
              <CompanyName />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControl sx={styles.margin}>
              <InputLabel htmlFor="cuserid">User ID</InputLabel>
              <Input
                id="cuserid"
                startAdornment={
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                }
                type="text"
                onChange={handleChange}
                autoFocus
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl sx={styles.margin}>
              <InputLabel htmlFor="cpassw">Password</InputLabel>
              <Input
                id="cpassw"
                startAdornment={
                  <InputAdornment position="start">
                    <LockOpen />
                  </InputAdornment>
                }
                type="password"
                onChange={handleChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" sx={styles.margin} onClick={login}>
              Login
            </Button>
          </Grid>
          {isForm && (
            <Grid item xs={12}>
              <Typography color="error" align="center" variant="subtitle2">
                Session Telah Habis. <br />
                Silahkan Masukkan kembali User ID dan Password Anda
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}

Login.defaultProps = {
  isForm: false,
  afterLogin: () => {},
};

export default Login;
