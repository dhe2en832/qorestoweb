import React, { useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ProgressLoader from './components/ProgressLoader';
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
          <div ref={anchorRef} aria-label="destination-scroll-top" style={{ padding: 0, minHeight: 16 }} />
          <Suspense fallback={<ProgressLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              {ModuleContext.map((module) =>
                module.menu.map(
                  (menus) =>
                    menus.active === 'Y' && (
                      <Route path={menus.path} element={
                        <PrivateRoute>
                          <menus.component />
                        </PrivateRoute>
                      } />
                    )
                )
              )}
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
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
