import { useEffect, useState } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTableId } from '../utils/table-session';
import ProgressLoader from '../components/ProgressLoader';

export default function PrivateRoute({ children }) {
  const auth        = useAuth();
  const location    = useLocation();
  const navigate    = useNavigate();
  const tableId     = getTableId();
  const isQRMode    = tableId !== '';

  // State untuk track proses auto-login yang sedang berjalan
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInDone,  setSignInDone]  = useState(false);

  useEffect(() => {
    // Jika mode QR dan belum login dan belum pernah dicoba → jalankan auto-login
    if (isQRMode && !auth.loggedIn && !isSigningIn && !signInDone) {
      setIsSigningIn(true);
      auth.signinAsGuest(() => {
        setIsSigningIn(false);
        setSignInDone(true);
        navigate(location.pathname, { replace: true });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQRMode, auth.loggedIn]);

  // Sedang proses login → tampilkan loader
  if (isSigningIn) return <ProgressLoader />;

  // Mode QR: belum login dan belum dicoba → loader sementara
  if (isQRMode && !auth.loggedIn && !signInDone) return <ProgressLoader />;

  // Mode biasa: belum login → redirect ke form login
  if (!auth.loggedIn) {
    return <Navigate to={{ pathname: '/login', state: { from: location } }} />;
  }

  return children;
}
