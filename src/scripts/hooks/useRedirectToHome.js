import { useCallback } from 'react';
import { useHistory } from 'react-router';

export default function useRedirectToHome() {
  const { replace } = useHistory();
  const redirectToHome = useCallback(() => {
    replace('/');
  }, [replace]);

  return { redirectToHome };
}
