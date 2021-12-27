import React, { useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Toolbar from '@mui/material/Toolbar';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ProgressLoader from './components/ProgressLoader';
import Navigation from './components/Navigation';
import ScrollToTop from './components/ScrollToTop';
import { ProvideAuth } from './contexts/AuthContext';
import ThemeContext from './contexts/ThemeContext';
import ModuleContext from './contexts/ModuleContext';
import PrivateRoute from './routes/PrivateRoute';

const Home = lazy(() => import('./modules/HOME'));
const Login = lazy(() => import('./modules/LOGIN'));
const NotFound = lazy(() => import('./modules/NOTFOUND'));

export default function App() {
  const anchorRef = useRef(null);
  return (
    <ThemeContext>
      <ProvideAuth>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <Navigation navLink={ModuleContext} />
          <Toolbar ref={anchorRef} aria-label="destination-scroll-top" />
          <Suspense fallback={<ProgressLoader />}>
            <Switch>
              <PrivateRoute exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              {ModuleContext.map((module) =>
                module.menu.map(
                  (menus) =>
                    menus.active === 'Y' && (
                      <PrivateRoute path={menus.path} component={menus.component} />
                    )
                )
              )}
              <Route path="/404" component={NotFound} />
              <Redirect from="*" to="/404" />
            </Switch>
          </Suspense>
          <ScrollToTop anchorRef={anchorRef}>
            <Fab color="secondary" size="small" aria-label="scroll-to-top">
              <KeyboardArrowUpIcon />
            </Fab>
          </ScrollToTop>
        </BrowserRouter>
      </ProvideAuth>
    </ThemeContext>
  );
}
