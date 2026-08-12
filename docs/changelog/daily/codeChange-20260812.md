# Code Changes Summary

## 12 Agustus 2026

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage; Tambah side effect; Tambah navigasi halaman  
**Lines:** 1-162

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 12 Agustus 2026
+ 
+ ### 🔐 Auth/Session
+ 
+ #### 1. src/scripts/contexts/AuthContext.js [20260812_090251]
+ **Fungsi:** Context autentikasi global  
+ **Perubahan:** Import: app-config; Tambah fungsi: signinAsGuest; Akses localStorage  
+ **Lines:** 10, 24-25, 27-28, 30-49, 60, 62-63, 77-78, 99-102, 131-133, 135, 165, 176
+ 
+ ```javascript
+ // Line 7:
+ + import { getAppConfig } from '../utils/app-config';
+ // Line 21:
+ -   const [loggedIn, setLoggedIn] = useLocalStorage('loggedIn', false);
+ -   const [userID, setUserID] = useLocalStorage('userID', null);
+ +   const [loggedIn, setLoggedIn]           = useLocalStorage('loggedIn', false);
+ +   const [userID, setUserID]               = useLocalStorage('userID', null);
+ -   const [sessionKey, setSessionKey] = useLocalStorage('sessionKey', null);
+ -   const [sessionID, setSessionID] = useLocalStorage('sessionID', null);
+ +   const [sessionKey, setSessionKey]       = useLocalStorage('sessionKey', null);
+ +   const [sessionID, setSessionID]         = useLocalStorage('sessionID', null);
+ -   // const signin = async (data, cb, isForm) => {
  // ... (truncated)
+ +                   : <PrivateRoute><Home /></PrivateRoute>  // akses biasa → home (butuh login)
+ +               } />
+ ```
+ 
+ ---
+ 
+ #### 3. src/scripts/utils/app-config.js [20260812_090251]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 25-26
+ 
+ ```javascript
+ // Line 22:
+ +   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
+ +   qr_guest_user:                 'GUEST',
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **🔐 Auth/Session:** 1 item
+ - **🔌 API:** 1 item
+ - **⚙️ Others:** 3 items
+ - **Total Files Modified:** 5
+ - **Main Focus:** ⚙️ Others
```

---

### 🔐 Auth/Session

#### 1. src/scripts/contexts/AuthContext.js [20260812_090252]
**Fungsi:** Context autentikasi global  
**Perubahan:** Import: app-config; Tambah fungsi: signinAsGuest; Akses localStorage  
**Lines:** 10, 24-25, 27-28, 30-49, 60, 62-63, 77-78, 99-102, 131-133, 135, 165, 176

```javascript
// Line 7:
+ import { getAppConfig } from '../utils/app-config';
// Line 21:
-   const [loggedIn, setLoggedIn] = useLocalStorage('loggedIn', false);
-   const [userID, setUserID] = useLocalStorage('userID', null);
+   const [loggedIn, setLoggedIn]           = useLocalStorage('loggedIn', false);
+   const [userID, setUserID]               = useLocalStorage('userID', null);
-   const [sessionKey, setSessionKey] = useLocalStorage('sessionKey', null);
-   const [sessionID, setSessionID] = useLocalStorage('sessionID', null);
+   const [sessionKey, setSessionKey]       = useLocalStorage('sessionKey', null);
+   const [sessionID, setSessionID]         = useLocalStorage('sessionID', null);
-   // const signin = async (data, cb, isForm) => {
-   //   setLoggedIn(true);
-   //   setUserID(data.cuserid);
-   //   setSessionTimeout(false);
-   //   setSessionKey('CSAComputerKeyword');
-   //   setSessionID('CSAComputerID');
-   //   cb();
-   // };
+   /**
+    * signinAsGuest — auto-login untuk pelanggan via QR scan.
+    * Tidak butuh form login. Gunakan secretkey dan user dari app.cfg.
+    * Dipanggil otomatis dari PrivateRoute saat URL punya ?table=XX.
+    */
+   const signinAsGuest = (cb) => {
  // ... (truncated)
-   //   setSessionTimeout(false);
-   //   setUserID(null);
-   //   setSessionKey(null);
-   //   setSessionID(null);
-   //   cb();
-   // };
- 
-     // Bersihkan credential fallback saat logout
-     // Bersihkan data BQO saat logout — pelanggan berikutnya mulai fresh
// Line 128:
-           'x-user': Config.SESSION_USER(),
-           secretkey: Config.SESSION_KEY(),
-           sessionid: Config.SESSION_ID(),
+           'x-user':    Config.SESSION_USER(),
+           secretkey:   Config.SESSION_KEY(),
+           sessionid:   Config.SESSION_ID(),
-         body: JSON.stringify({
-           action: 'logout',
-         }),
+         body: JSON.stringify({ action: 'logout' }),
// Line 162:
-     onIdle: handleOnIdle,
+     onIdle:  handleOnIdle,
// Line 173:
+     signinAsGuest,
```

---

### 🔌 API

#### 1. src/scripts/routes/PrivateRoute.js [20260812_090252]
**Fungsi:** Route: PrivateRoute  
**Perubahan:** Import: react; Tambah side effect; Import: react-router-dom; Import: table-session; Tambah navigasi halaman  
**Lines:** 1-2, 4, 7-31

```javascript
// Line 1:
- import { useLocation, Navigate } from 'react-router-dom';
+ import { useEffect } from 'react';
+ import { useLocation, Navigate, useNavigate } from 'react-router-dom';
+ import { getTableId } from '../utils/table-session';
-   let isAuthenticated = useAuth().loggedIn;
-   let location = useLocation();
-   return isAuthenticated ? children : <Navigate to={{
-     pathname: '/login',
-     state: { from: location },
-   }} />
+   const auth         = useAuth();
+   const location     = useLocation();
+   const navigate     = useNavigate();
+   const tableId      = getTableId();
+   const isQRMode     = tableId !== '';
+ 
+   useEffect(() => {
+     // Jika ada ?table= di URL (mode QR) dan belum login → auto-login sebagai guest
+     if (isQRMode && !auth.loggedIn) {
+       auth.signinAsGuest(() => {
+         // Setelah auto-login, lanjut ke tujuan semula
+         navigate(location.pathname, { replace: true });
+       });
+     }
+   }, [isQRMode, auth, location.pathname, navigate]);
+ 
+   // Mode QR: sedang proses auto-login → render null (tunggu sebentar)
+   if (isQRMode && !auth.loggedIn) return null;
+ 
+   // Mode biasa: belum login → redirect ke form login
+   if (!auth.loggedIn) {
+     return <Navigate to={{ pathname: '/login', state: { from: location } }} />;
+   }
+ 
+   return children;
```

---

### ⚙️ Others

#### 1. public/app.cfg [20260812_090252]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 9-11

```javascript
// Line 6:
-   "use_mock_bqo": false
+   "use_mock_bqo": false,
+   "qr_session_key": "78dfcc919bfa35f1852da50f7c6d4d14",
+   "qr_guest_user": "GUEST"
```

---

#### 2. src/scripts/App.js [20260812_090252]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Import: table-session  
**Lines:** 12, 50-54

```javascript
// Line 9:
- import { initTableId } from './utils/table-session';
+ import { initTableId, getTableId } from './utils/table-session';
// Line 47:
-               <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
+               <Route path="/" element={
+                 getTableId()
+                   ? <Navigate to="/menu" replace />        // QR scan → langsung ke menu
+                   : <PrivateRoute><Home /></PrivateRoute>  // akses biasa → home (butuh login)
+               } />
```

---

#### 3. src/scripts/utils/app-config.js [20260812_090252]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 25-26

```javascript
// Line 22:
+   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
+   qr_guest_user:                 'GUEST',
```

---

#### 4. public/qr-tables.html [20260812_091045]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **📖 Documentation:** 1 item
- **🔐 Auth/Session:** 1 item
- **🔌 API:** 1 item
- **⚙️ Others:** 4 items
- **Total Files Modified:** 7
- **Main Focus:** ⚙️ Others
