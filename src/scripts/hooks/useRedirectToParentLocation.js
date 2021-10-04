import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router';

export default function useRedirectToParentLocation() {
  const { replace } = useHistory();
  const location = useLocation();
  const splitLocation = location.pathname.split('/');
  const parentLocation = `/${splitLocation[1]}`;
  const redirectToParentLocation = useCallback(() => {
    replace(parentLocation);
  }, [replace, parentLocation]);

  return { redirectToParentLocation };
}
