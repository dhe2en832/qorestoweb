import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  let isAuthenticated = useAuth().loggedIn;
  let location = useLocation();
  return isAuthenticated ? children : <Navigate to={{
    pathname: '/login',
    state: { from: location },
  }} />
}
