import React, { createContext, useContext } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import Config from '../Config';

import AlertDialog from '../components/AlertDialog';
import AlertDialogNested from '../components/AlertDialogNested';
import useLocalStorage from '../hooks/useLocalStorage';
import { typesError } from '../utils/types-error';
import ApiRoute from '../routes/ApiRoute';

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [loggedIn, setLoggedIn] = useLocalStorage('loggedIn', false);
  const [userID, setUserID] = useLocalStorage('userID', null);
  const [sessionTimeout, setSessionTimeout] = useLocalStorage('sessionTimeout', false);
  const [sessionKey, setSessionKey] = useLocalStorage('sessionKey', null);
  const [sessionID, setSessionID] = useLocalStorage('sessionID', null);

  // const signin = async (data, cb, isForm) => {
  //   setLoggedIn(true);
  //   setUserID(data.cuserid);
  //   setSessionTimeout(false);
  //   setSessionKey('CSAComputerKeyword');
  //   setSessionID('CSAComputerID');
  //   cb();
  // };

  const signin = async (data, cb, isForm) => {
    try {
      const res = await fetch(ApiRoute.LOGIN_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user': data.cuserid,
          'x-password': data.cpassw,
        },
        body: JSON.stringify({
          action: 'login',
        }),
      });
      const resSessionKey = await res.headers.get('secretkey');
      const resSessionID = await res.headers.get('sessionid');
      const resJson = await res.json();
      if (resJson.result === true) {
        if (isForm) {
          window.localStorage.setItem('sessionKey', JSON.stringify(resSessionKey));
          window.localStorage.setItem('sessionID', JSON.stringify(resSessionID));
          window.localStorage.setItem('userID', JSON.stringify(data.cuserid));
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
      let messageError;
      switch (error) {
        case typesError.FETCH.msg:
          messageError = typesError.FETCH.res;
          break;
        case typesError.EMPTY_USER.msg:
          messageError = typesError.EMPTY_USER.res;
          break;
        default: {
          if (error.message === typesError.FETCH.msg) messageError = typesError.FETCH.res;
          else messageError = error;
          break;
        }
      }
      isForm
        ? AlertDialogNested('LoginForm', 'error', 'Salah', messageError)
        : AlertDialog('error', 'Salah', messageError);
    }
  };

  // const signout = (cb) => {
  //   setLoggedIn(false);
  //   setSessionTimeout(false);
  //   setUserID(null);
  //   setSessionKey(null);
  //   setSessionID(null);
  //   cb();
  // };

  const signout = async (cb) => {
    try {
      const res = await fetch(ApiRoute.LOGIN_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user': Config.SESSION_USER(),
          secretkey: Config.SESSION_KEY(),
          sessionid: Config.SESSION_ID(),
        },
        body: JSON.stringify({
          action: 'logout',
        }),
      });
      const resJson = await res.json();
      if (resJson.result === true) {
        setLoggedIn(false);
        setSessionTimeout(false);
        setUserID(null);
        setSessionKey(null);
        setSessionID(null);
        cb();
      } else if (resJson.result === false) throw resJson.onfail.cerror;
      else throw resJson.message;
    } catch (error) {
      let messageError;
      switch (error) {
        case typesError.FETCH.msg:
          messageError = typesError.FETCH.res;
          break;
        default: {
          if (error.message === typesError.FETCH.msg) messageError = typesError.FETCH.res;
          else messageError = error;
          break;
        }
      }
      AlertDialog('error', 'Salah', messageError);
    }
  };

  const handleOnIdle = () => {
    setUserID(null);
    setSessionTimeout(true);
    setSessionKey('Session Has Been Timed Out');
  };

  useIdleTimer({
    timeout: Config.IDLE_TIMEOUT,
    onIdle: handleOnIdle,
    debounce: 500,
  });

  return {
    loggedIn,
    userID,
    sessionTimeout,
    sessionKey,
    sessionID,
    signin,
    signout,
  };
}
