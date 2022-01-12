import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockOpen from '@mui/icons-material/LockOpen';
import { useAuth } from '../../contexts/AuthContext';
import CompanyName from '../../components/CompanyName';
import AlertContainer from '../../components/AlertContainer';
import { ReactComponent as Logo } from '../../../images/logo.svg';

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
  const [loading, setLoading] = useState(false);
  const handleChange = (event) => {
    setState((prevState) => {
      return { ...prevState, [event.target.id]: event.target.value };
    });
  };

  const handleKeyPress = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    switch (event.key) {
      case 'Enter':
        login(event);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  let auth = useAuth();
  let navigate = useNavigate();
  let location = useLocation();
  let { from } = location.state || { from: { pathname: '/' } };
  let login = (event) => {
    event.preventDefault();
    setLoading(true)
    auth.signin(state, () => (isForm ? afterLogin() : navigate(from)), isForm, setLoading);
  };

  return (
    <>
      {isForm && <AlertContainer idElem={'LoginForm'} />}
      <Container maxWidth="sm" sx={styles.root}>
        <Grid container spacing={1} justifyContent="center" alignItems="center" direction="column">
          {!isForm && (
            <>
              <Grid item container xs={12} justifyContent="center">
                <Logo height={50} width={50} />
              </Grid>
              <Grid item xs={12} mb={3}>
                <CompanyName />
              </Grid>
            </>
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
                onKeyPress={handleKeyPress}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <LoadingButton variant="contained" color="primary" sx={styles.margin} onClick={login} loading={loading}>
              Login
            </LoadingButton>
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
  afterLogin: () => { },
};

export default Login;
