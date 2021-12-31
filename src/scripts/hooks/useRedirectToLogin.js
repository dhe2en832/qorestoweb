import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function useRedirectToLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectToLogin = useCallback(() => {
    navigate('/login', { from: location, replace: true });
  }, [navigate, location]);

  return { redirectToLogin };
}
