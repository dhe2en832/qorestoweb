import React, { createContext, useContext } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import Config from '../Config';

import AlertDialog from '../components/AlertDialog';
import AlertDialogNested from '../components/AlertDialogNested';
import useLocalStorage from '../hooks/useLocalStorage';
import { typesError } from '../utils/types-error';
import ApiRoute from '../routes/ApiRoute';
import { getAppConfig } from '../utils/app-config';

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [loggedIn, setLoggedIn]           = useLocalStorage('loggedIn', false);
  const [userID, setUserID]               = useLocalStorage('userID', null);
  const [sessionTimeout, setSessionTimeout] = useLocalStorage('sessionTimeout', false);
  const [sessionKey, setSessionKey]       = useLocalStorage('sessionKey', null);
  const [sessionID, setSessionID]         = useLocalStorage('sessionID', null);

  /**
   * signinAsGuest — auto-login untuk pelanggan via QR scan.
   * Tidak butuh form login. Gunakan secretkey dan user dari app.cfg.
   * Dipanggil otomatis dari PrivateRoute saat URL punya ?table=XX.
   */
  const signinAsGuest = (cb) => {
    const cfg        = getAppConfig();
    const guestKey   = cfg.qr_session_key || '';
    const guestUser  = cfg.qr_guest_user  || 'GUEST';
    // Reset data order lama — pelanggan baru mulai fresh
    window.localStorage.removeItem('QoCart');
    window.localStorage.removeItem('QoOrderInfo');
    window.localStorage.removeItem('QoReturnPath');
    setLoggedIn(true);
    setUserID(guestUser);
    setSessionTimeout(false);
    setSessionKey(guestKey);
    setSessionID(guestKey);
    if (typeof cb === 'function') cb();
  };

  const signin = async (data, cb, isForm, setLoading) => {
    try {
      const res = await fetch(ApiRoute.LOGIN_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user': data.cuserid,
          'x-password': data.cpassw,
        },
        body: JSON.stringify({ action: 'login' }),
      });
      const resSessionKey = res.headers.get('secretkey');
      const resSessionID  = res.headers.get('sessionid');
      const resJson = await res.json();
      if (resJson.result === true) {
        if (process.env.REACT_APP_API_LOCAL_ENDPOINT) {
          window.localStorage.setItem('auth_local_user', data.cuserid);
          window.localStorage.setItem('auth_local_pass', data.cpassw);
        }
        const isRelogin = window.localStorage.getItem('QoReturnPath') !== null;
        if (!isRelogin) {
          window.localStorage.removeItem('QoCart');
          window.localStorage.removeItem('QoOrderInfo');
        }
        if (isForm) {
          window.localStorage.setItem('sessionKey', JSON.stringify(resSessionKey));
          window.localStorage.setItem('sessionID',  JSON.stringify(resSessionID));
          window.localStorage.setItem('userID',     JSON.stringify(data.cuserid));
        } else {
          setLoggedIn(true);
          setUserID(data.cuserid);
          setSessionTimeout(false);
          setSessionKey(resSessionKey);
          setSessionID(resSessionID);
        }
        cb();
      } else if (resJson.result === false) throw resJson.onfail.cerror;
      else throw resJson.message;
    } catch (error) {
      setLoading && setLoading(false);
      let messageError;
      switch (error) {
        case typesError.FETCH.msg:
          messageError = typesError.FETCH.res;
          break;
        case typesError.LOGIN.EMPTY_USER.msg:
          messageError = typesError.LOGIN.EMPTY_USER.res;
          break;
        default:
          messageError = error.message === typesError.FETCH.msg
            ? typesError.FETCH.res
            : error;
          break;
      }
      isForm
        ? AlertDialogNested('LoginForm', 'error', 'Salah', messageError)
        : AlertDialog('error', 'Salah', messageError);
    }
  };

  const handleLogout = (cb) => {
    setLoggedIn(false);
    setSessionTimeout(false);
    setUserID(null);
    setSessionKey(null);
    setSessionID(null);
    window.localStorage.removeItem('auth_local_user');
    window.localStorage.removeItem('auth_local_pass');
    window.localStorage.removeItem('QoCart');
    window.localStorage.removeItem('QoOrderInfo');
    window.localStorage.removeItem('QoReturnPath');
    if (typeof cb === 'function') cb();
  };

  const signout = async (cb) => {
    try {
      const res = await fetch(ApiRoute.LOGIN_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user':    Config.SESSION_USER(),
          secretkey:   Config.SESSION_KEY(),
          sessionid:   Config.SESSION_ID(),
        },
        body: JSON.stringify({ action: 'logout' }),
      });
      const resJson = await res.json();
      if (resJson.result === true)
        AlertDialog('success', 'Logout', typesError.SESSION_CLOSED.res, () => handleLogout(cb));
      else if (resJson.result === false) throw resJson.onfail.cerror;
      else throw resJson.message;
    } catch (error) {
      switch (error) {
        case typesError.FETCH.msg:
          AlertDialog('error', 'Salah', typesError.FETCH.res, () => handleLogout(cb));
          break;
        case typesError.SESSION_CLOSED.msg:
          AlertDialog('success', 'Logout', typesError.SESSION_CLOSED.res, () => handleLogout(cb));
          break;
        default:
          AlertDialog('error', 'Salah', error, () => handleLogout(cb));
          break;
      }
    }
  };

  const handleOnIdle = () => {
    setUserID(null);
    setSessionTimeout(true);
    setSessionKey('Session Has Been Timed Out');
  };

  useIdleTimer({
    timeout: Config.IDLE_TIMEOUT,
    onIdle:  handleOnIdle,
    debounce: 500,
  });

  return {
    loggedIn,
    userID,
    sessionTimeout,
    sessionKey,
    sessionID,
    signin,
    signinAsGuest,
    signout,
  };
}
