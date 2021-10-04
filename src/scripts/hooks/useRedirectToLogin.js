import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export default function useRedirectToLogin() {
  const { replace } = useHistory();
  const location = useLocation();
  const redirectToLogin = useCallback(() => {
    replace('/login', { from: location });
  }, [replace, location]);

  return { redirectToLogin };
}
