import { useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTableId } from '../utils/table-session';

export default function PrivateRoute({ children }) {
  const auth         = useAuth();
  const location     = useLocation();
  const navigate     = useNavigate();
  const tableId      = getTableId();
  const isQRMode     = tableId !== '';

  useEffect(() => {
    // Jika ada ?table= di URL (mode QR) dan belum login → auto-login sebagai guest
    if (isQRMode && !auth.loggedIn) {
      auth.signinAsGuest(() => {
        // Setelah auto-login, lanjut ke tujuan semula
        navigate(location.pathname, { replace: true });
      });
    }
  }, [isQRMode, auth, location.pathname, navigate]);

  // Mode QR: sedang proses auto-login → render null (tunggu sebentar)
  if (isQRMode && !auth.loggedIn) return null;

  // Mode biasa: belum login → redirect ke form login
  if (!auth.loggedIn) {
    return <Navigate to={{ pathname: '/login', state: { from: location } }} />;
  }

  return children;
}
