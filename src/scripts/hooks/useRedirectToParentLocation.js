import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router';
import { getParentLocation } from '../utils/getter';

export default function useRedirectToParentLocation() {
  const { replace } = useHistory();
  const location = useLocation().pathname;
  const parentLocation = `/${getParentLocation(location)}`;
  const redirectToParentLocation = useCallback(() => {
    replace(parentLocation);
  }, [replace, parentLocation]);

  return { redirectToParentLocation };
}
