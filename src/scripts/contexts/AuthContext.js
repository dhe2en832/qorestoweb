import React, { createContext, useContext } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import Config from '../Config';

// import AlertDialog from '../components/AlertDialog';
// import AlertDialogNested from '../components/AlertDialogNested';
import useLocalStorage from '../hooks/useLocalStorage';
// import ApiRoute from '../routes/ApiRoute';

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

  const signin = async (data, cb, isForm) => {
    setLoggedIn(true);
    setUserID(data.cuserid);
    setSessionTimeout(false);
    setSessionKey('CSAComputerKeyword');
    setSessionID('CSAComputerID');
    cb();
  };

  // const signin = async (data, cb, isForm) => {
  //   try {
  //     const res = await fetch(ApiRoute.LOGIN_X, {
  //       method: 'POST',
  //       headers: {
  //         'content-type': 'application/json',
  //         'x-user': data.cuserid,
  //         'x-password': data.cpassw,
  //       },
  //       body: JSON.stringify({
  //         action: 'login',
  //       }),
  //     });
  //     const resJson = await res.json();
  //     console.log(resJson);
  //     if (resJson.result === true) {
  //       setLoggedIn(true);
  //       setUserID(data.cuserid);
  //       setSessionTimeout(false);
  //       setSessionKey(resJson.onsuccess.sessionKey || 'Not Set');
  //       setSessionID(resJson.onsuccess.sessionID || 'Not Set');
  //       cb();
  //     } else throw resJson.onfail.cerror;
  //   } catch (error) {
  //     const messageError = ['error', 'Terjadi Kesalahan', error];
  //     isForm
  //       ? AlertDialogNested('LoginForm', ...messageError)
  //       : AlertDialog(...messageError);
  //   }
  // };

  const signout = (cb) => {
    setLoggedIn(false);
    setSessionTimeout(false);
    setUserID(null);
    setSessionKey(null);
    setSessionID(null);
    cb();
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
