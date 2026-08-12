import React, { useRef, lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ProgressLoader from './components/ProgressLoader';
import ScrollToTop from './components/ScrollToTop';
import { ProvideAuth } from './contexts/AuthContext';
import ThemeContext from './contexts/ThemeContext';
import ModuleContext from './contexts/ModuleContext';
import PrivateRoute from './routes/PrivateRoute';
import { loadAppConfig } from './utils/app-config';
import { initTableId, getTableId } from './utils/table-session';

const Home = lazy(() => import('./modules/HOME'));
const Login = lazy(() => import('./modules/LOGIN'));
const NotFound = lazy(() => import('./modules/NOTFOUND'));

export default function App() {
  const anchorRef = useRef(null);
  const [configReady, setConfigReady] = useState(false);

  // Load app.cfg dan inisialisasi table ID dari URL — blok render sampai selesai
  useEffect(() => {
    const isNewScan = initTableId(); // baca ?table=XX dari URL, simpan ke sessionStorage
    if (isNewScan) {
      // Scan QR baru — reset semua data sesi pelanggan sebelumnya agar mulai fresh
      window.localStorage.removeItem('QoCart');
      window.localStorage.removeItem('QoOrderInfo');
      window.localStorage.removeItem('QoReturnPath');
      window.localStorage.removeItem('loggedIn');
      window.localStorage.removeItem('sessionKey');
      window.localStorage.removeItem('sessionID');
      window.localStorage.removeItem('userID');
    }
    loadAppConfig().finally(() => setConfigReady(true));
  }, []);

  if (!configReady) return <ProgressLoader />;

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
              <Route path="/" element={
                getTableId()
                  ? <Navigate to="/menu" replace />        // QR scan → langsung ke menu
                  : <PrivateRoute><Home /></PrivateRoute>  // akses biasa → home (butuh login)
              } />
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
