# Code Changes Summary

## 12 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_093433]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Tambah navigasi halaman  
**Lines:** 415-425

```javascript
// Line 412:
-               <Grid item xs={1}>
-                 <IconButton
-                   sx={styles.appBarIcon}
-                   onClick={() => {
-                     navigate('/');
-                   }}
-                 >
-                   <BackIcon />
-                 </IconButton>
-               </Grid>
+               {/* Tombol back hanya tampil di mode non-QR (akses via login biasa) */}
+               {!getTableId() && (
+                 <Grid item xs={1}>
+                   <IconButton
+                     sx={styles.appBarIcon}
+                     onClick={() => { navigate('/'); }}
+                   >
+                     <BackIcon />
+                   </IconButton>
+                 </Grid>
+               )}
```

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage  
**Lines:** 5-67, 70, 133, 181, 184-192, 196, 216, 229-234, 236, 239-240

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
+ **Fungsi:** Implementasi: codeChange-20260812  
+ **Perubahan:** Akses localStorage; Tambah side effect; Tambah navigasi halaman  
+ **Lines:** 1-162
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 12 Agustus 2026
+ + 
+ + ### 🔐 Auth/Session
+ + 
+ + #### 1. src/scripts/contexts/AuthContext.js [20260812_090251]
+ + **Fungsi:** Context autentikasi global  
+ + **Perubahan:** Import: app-config; Tambah fungsi: signinAsGuest; Akses localStorage  
+ + **Lines:** 10, 24-25, 27-28, 30-49, 60, 62-63, 77-78, 99-102, 131-133, 135, 165, 176
+ + 
+ + ```javascript
+ + // Line 7:
+ + + import { getAppConfig } from '../utils/app-config';
+ + // Line 21:
  // ... (truncated)
+ 
+ ```javascript
+ // Line 6:
+ -   "use_mock_bqo": false
+ +   "use_mock_bqo": false,
+ +   "qr_session_key": "78dfcc919bfa35f1852da50f7c6d4d14",
+ +   "qr_guest_user": "GUEST"
+ ```
- #### 2. src/scripts/App.js [20260812_090251]
+ #### 2. src/scripts/App.js [20260812_090252]
// Line 213:
- #### 3. src/scripts/utils/app-config.js [20260812_090251]
+ #### 3. src/scripts/utils/app-config.js [20260812_090252]
// Line 226:
+ #### 4. public/qr-tables.html [20260812_091045]
+ **Fungsi:** Implementasi: qr-tables  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ - **📖 Documentation:** 1 item
- - **⚙️ Others:** 3 items
- - **Total Files Modified:** 5
+ - **⚙️ Others:** 4 items
+ - **Total Files Modified:** 7
```

---

#### 2. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
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

#### 2. src/scripts/contexts/AuthContext.js [20260812_093433]
**Fungsi:** Context autentikasi global  
**Perubahan:** Tambah fungsi: signinAsGuest; Tambah error handling; Tambah HTTP request  
**Lines:** 32-33, 35-39, 44-97

```javascript
// Line 29:
-    * Tidak butuh form login. Gunakan secretkey dan user dari app.cfg.
-    * Dipanggil otomatis dari PrivateRoute saat URL punya ?table=XX.
+    * Melakukan login ke backend dengan credential dari app.cfg,
+    * sehingga secretkey yang dipakai valid untuk akses API.
-   const signinAsGuest = (cb) => {
-     const cfg        = getAppConfig();
-     const guestKey   = cfg.qr_session_key || '';
-     const guestUser  = cfg.qr_guest_user  || 'GUEST';
+   const signinAsGuest = async (cb) => {
+     const cfg       = getAppConfig();
+     const guestUser = cfg.qr_guest_user || '';
+     const guestPass = cfg.qr_guest_pass || '';
+ 
-     setLoggedIn(true);
-     setUserID(guestUser);
-     setSessionTimeout(false);
-     setSessionKey(guestKey);
-     setSessionID(guestKey);
-     if (typeof cb === 'function') cb();
+ 
+     if (!guestUser || !guestPass) {
+       // Fallback: pakai static key jika credential tidak dikonfigurasi
+       const staticKey = cfg.qr_session_key || '';
+       setLoggedIn(true);
  // ... (truncated)
+         setUserID(guestUser);
+         setSessionTimeout(false);
+         setSessionKey(resSessionKey);
+         setSessionID(resSessionID);
+         if (typeof cb === 'function') cb();
+       } else {
+         // Login gagal — tetap masuk tapi dengan static key sebagai fallback
+         const staticKey = cfg.qr_session_key || '';
+         setLoggedIn(true);
+         setUserID('GUEST');
+         setSessionTimeout(false);
+         setSessionKey(staticKey);
+         setSessionID(staticKey);
+         if (typeof cb === 'function') cb();
+       }
+     } catch (_) {
+       // Network error — fallback ke static key
+       const staticKey = cfg.qr_session_key || '';
+       setLoggedIn(true);
+       setUserID('GUEST');
+       setSessionTimeout(false);
+       setSessionKey(staticKey);
+       setSessionID(staticKey);
+       if (typeof cb === 'function') cb();
+     }
```

---

#### 3. src/scripts/utils/table-session.js [20260812_093433]
**Fungsi:** Utility: table-session  
**Perubahan:** Pembaruan kode  
**Lines:** 21-22, 29, 31

```javascript
// Line 18:
+  *
+  * @returns {boolean} true jika URL punya ?table= (scan baru), false jika tidak
+     return true; // scan baru dari URL
+   return false; // reload biasa, tidak ada ?table= di URL
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

#### 1. public/qr-tables.html [20260812_091046]
**Fungsi:** Fungsi: padNum  
**Perubahan:** Tambah fungsi: padNum; Tambah fungsi: generate  
**Lines:** 1-245

```javascript
// Line 1:
+ <!DOCTYPE html>
+ <html lang="id">
+ <head>
+   <meta charset="UTF-8" />
+   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+   <title>QR Code Meja — Qoresto</title>
+   <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
+   <style>
+     * { box-sizing: border-box; margin: 0; padding: 0; }
+ 
+     body {
+       font-family: 'Segoe UI', Arial, sans-serif;
+       background: #f0f0f0;
+       padding: 20px;
+     }
+ 
+     h1 {
+       text-align: center;
+       margin-bottom: 8px;
+       color: #3f50b5;
+       font-size: 1.4rem;
+     }
+ 
+     .subtitle {
  // ... (truncated)
+           <div class="table-label">Meja ${tableId}</div>
+           <div class="qr-wrapper" id="qr-${tableId}"></div>
+           <div class="url-text">${url}</div>
+           <div class="scan-hint">📱 Scan untuk memesan</div>
+         `;
+         grid.appendChild(card);
+ 
+         // Generate QR
+         new QRCode(document.getElementById(`qr-${tableId}`), {
+           text:          url,
+           width:         150,
+           height:        150,
+           colorDark:     '#222222',
+           colorLight:    '#ffffff',
+           correctLevel:  QRCode.CorrectLevel.M,
+         });
+       }
+     }
+ 
+     // Auto-generate saat halaman load
+     window.addEventListener('load', generate);
+   </script>
+ 
+ </body>
+ </html>
```

---

#### 2. public/app.cfg [20260812_090252]
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

#### 3. src/scripts/App.js [20260812_090252]
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

#### 4. src/scripts/utils/app-config.js [20260812_090252]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 25-26

```javascript
// Line 22:
+   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
+   qr_guest_user:                 'GUEST',
```

---

#### 5. ublic/app.cfg [20260812_093433]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  

---

#### 6. src/scripts/App.js [20260812_093433]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Akses localStorage  
**Lines:** 24-34

```javascript
// Line 21:
-     initTableId(); // baca ?table=XX dari URL, simpan ke sessionStorage
+     const isNewScan = initTableId(); // baca ?table=XX dari URL, simpan ke sessionStorage
+     if (isNewScan) {
+       // Scan QR baru — reset semua data sesi pelanggan sebelumnya agar mulai fresh
+       window.localStorage.removeItem('QoCart');
+       window.localStorage.removeItem('QoOrderInfo');
+       window.localStorage.removeItem('QoReturnPath');
+       window.localStorage.removeItem('loggedIn');
+       window.localStorage.removeItem('sessionKey');
+       window.localStorage.removeItem('sessionID');
+       window.localStorage.removeItem('userID');
+     }
```

---

#### 7. src/scripts/utils/app-config.js [20260812_093433]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 27

```javascript
// Line 24:
+   qr_guest_pass:                 '',    // password untuk login guest via QR
```

---

## 📊 **Summary**
- **✨ Features:** 1 item
- **📖 Documentation:** 2 items
- **🔐 Auth/Session:** 3 items
- **🔌 API:** 1 item
- **⚙️ Others:** 7 items
- **Total Files Modified:** 14
- **Main Focus:** ⚙️ Others
