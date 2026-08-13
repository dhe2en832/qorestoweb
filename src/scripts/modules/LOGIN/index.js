import React, { useState, useEffect } from 'react';
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
import ServerLabel from '../../components/ServerLabel';
import { ReactComponent as Logo } from '../../../images/logo.svg';
import { getTableId } from '../../utils/table-session';
import ProgressLoader from '../../components/ProgressLoader';

function Login({ isForm, afterLogin }) {
  // ── Semua hooks harus di atas, sebelum conditional return apapun ──
  const authForQR  = useAuth();
  const navigateQR = useNavigate();
  const location   = useLocation();
  const auth       = useAuth();
  const navigate   = useNavigate();

  const [state,       setState]       = useState({ cuserid: '', cpassw: '' });
  const [loading,     setLoading]     = useState(false);
  const [autoLogging, setAutoLogging] = useState(false);

  const tableId = getTableId();
  const { from } = location.state || { from: { pathname: '/' } };

  const styles = {
    root:   { padding: '16px' },
    margin: { margin: '8px'   },
  };

  // QR mode: jika pelanggan sampai di halaman login (misal session expired redirect),
  // auto re-login tanpa tampilkan form
  useEffect(() => {
    if (tableId && !isForm && !authForQR.loggedIn) {
      setAutoLogging(true);
      authForQR.signinAsGuest(() => {
        const returnPath = window.localStorage.getItem('QoReturnPath') || '/menu';
        window.localStorage.removeItem('QoReturnPath');
        navigateQR(returnPath, { replace: true });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    setState((prevState) => ({ ...prevState, [event.target.id]: event.target.value }));
  };

  const handleKeyPress = (event) => {
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') login(event);
    event.preventDefault();
  };

  const login = (event) => {
    event.preventDefault();
    setLoading(true);
    auth.signin(state, () => {
      const returnPath = window.localStorage.getItem('QoReturnPath');
      if (returnPath) {
        window.localStorage.removeItem('QoReturnPath');
        isForm ? afterLogin() : navigate(returnPath);
      } else {
        isForm ? afterLogin() : navigate(from);
      }
    }, isForm, setLoading);
  };

  // Early return setelah semua hooks
  if (autoLogging) return <ProgressLoader />;

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
              <Grid item xs={12} mb={1}>
                <CompanyName />
              </Grid>
              <Grid item container xs={12} justifyContent="center" mb={2}>
                <ServerLabel />
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
