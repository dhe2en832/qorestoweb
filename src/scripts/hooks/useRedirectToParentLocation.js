import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { getParentLocation } from '../utils/getter';

export default function useRedirectToParentLocation() {
  const navigate = useNavigate();
  const location = useLocation().pathname;
  const parentLocation = `/${getParentLocation(location)}`;
  const redirectToParentLocation = useCallback(() => {
    navigate(parentLocation, { replace: true });
  }, [navigate, parentLocation]);

  return { redirectToParentLocation };
}
