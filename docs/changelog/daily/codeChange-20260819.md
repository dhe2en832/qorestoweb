# Code Changes Summary

## 19 Agustus 2026

### 📖 Documentation

#### 1. docs/ALUR-QORESTOWEB.md [20260819_104952]
**Fungsi:** Implementasi: ALUR-QORESTOWEB  
**Perubahan:** Pembaruan kode  
**Lines:** 238-241, 243, 245-248, 250, 252-294

```javascript
// Line 235:
- Akses: `http://{SERVER}/qorestoweb/qr-tables.html`
+ ### Akses
+ ```
+ http://192.168.100.13/qorestoweb/qr-tables.html
+ ```
- Fitur:
+ ### Fitur
- - URL otomatis sesuai mode
+ - **Dual QR per meja**: QR utama (besar) + QR cadangan (kecil)
+ - QR utama → server `.13`, QR cadangan → server `.85`
+ - Label "Jika tidak bisa dibuka, scan ini:" di QR cadangan
+ - URL server utama dan cadangan bisa diedit manual
- - Print-friendly (Ctrl+P)
+ - Print-friendly (Ctrl+P) — layout 3 kolom
+ - Mode Development tidak tampilkan QR backup
+ 
+ ### Layout Card Meja (Production)
+ ```
+ ┌──────────────────────┐
+ │      QORESTO         │
+ │     Meja 07          │
+ │  ┌──────────────┐    │
+ │  │  QR UTAMA    │    │
+ │  │  (150x150)   │    │
  // ... (truncated)
+ └──────────────────────┘
+ ```
+ 
+ ---
+ 
+ ## 10. Fallback Server Cadangan
+ 
+ ### Arsitektur
+ - Server utama: `192.168.100.13` (host web app + API)
+ - Server cadangan: `192.168.100.85` (host web app + API yang sama)
+ - Qorestoweb di-deploy di **kedua server**
+ 
+ ### Fallback API (level aplikasi)
+ Jika server utama tidak bisa dijangkau (timeout/network error), semua API call otomatis dicoba ke server cadangan:
+ 
+ | Komponen | Primary | Fallback |
+ |----------|---------|----------|
+ | Login (`signinAsGuest`) | `.13/api/csa/resto/login_x` | `.85/api/csa/resto/login_x` |
+ | Menu (`bstock_x`) | `.13/api/csa/resto/bstock_x` | `.85/api/csa/resto/bstock_x` |
+ | Order (`bqo_x`) | `.13/api/csa/resto/bqo_x` | `.85/api/csa/resto/bqo_x` |
+ 
+ ### Keterbatasan
+ - Jika server utama mati dan pelanggan **belum pernah** mengakses app → halaman tidak bisa load (browser error)
+ - Solusi: **2 QR per meja** — pelanggan scan QR cadangan yang mengarah ke `.85`
+ - Jika pelanggan **pernah** mengakses sebelumnya → service worker bisa serve halaman dari cache
```

---

#### 2. docs/changelog/daily/codeChange-20260819.md [20260819_104952]
**Fungsi:** Implementasi: codeChange-20260819  
**Perubahan:** Tambah error handling; Tambah HTTP request  
**Lines:** 5-73, 182, 185-239, 244, 248-249

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260819.md [20260819_104757]
+ **Fungsi:** Implementasi: codeChange-20260819  
+ **Perubahan:** Tambah error handling; Tambah HTTP request  
+ **Lines:** 1-124
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 19 Agustus 2026
+ + 
+ + ### 🔐 Auth/Session
+ + 
+ + #### 1. src/scripts/contexts/AuthContext.js [20260819_104757]
+ + **Fungsi:** Context autentikasi global  
+ + **Perubahan:** Tambah fungsi: localUrl; Tambah error handling; Tambah HTTP request  
+ + **Lines:** 94-122
+ + 
+ + ```javascript
+ + // Line 91:
+ + -       // Network error — fallback ke static key
+ + +       // Network error pada server utama — coba login ke server cadangan
  // ... (truncated)
+ -         // Generate QR
+ +         // QR utama — besar
+ -           text:         url,
+ +           text:         urlPrimary,
+ -           colorDark:    isDev ? '#c0390b' : '#222222',  // merah untuk dev, hitam untuk prod
+ +           colorDark:    isDev ? '#c0390b' : '#222222',
+ + 
+ +         // QR cadangan — kecil
+ +         if (urlBackup && !isDev) {
+ +           new QRCode(document.getElementById(`qr-backup-${tableId}`), {
+ +             text:         urlBackup,
+ +             width:        80,
+ +             height:       80,
+ +             colorDark:    '#666666',
+ +             colorLight:   '#ffffff',
+ +             correctLevel: QRCode.CorrectLevel.L,
+ +           });
+ +         }
+ -     // Auto-generate saat halaman load
+ ```
+ - **📖 Documentation:** 2 items
- - **Total Files Modified:** 3
- - **Main Focus:** 🔐 Auth/Session
+ - **Total Files Modified:** 5
+ - **Main Focus:** 📖 Documentation
```

---

#### 3. docs/changelog/daily/codeChange-20260819.md [20260819_104757]
**Fungsi:** Implementasi: codeChange-20260819  
**Perubahan:** Tambah error handling; Tambah HTTP request  
**Lines:** 1-124

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 19 Agustus 2026
+ 
+ ### 🔐 Auth/Session
+ 
+ #### 1. src/scripts/contexts/AuthContext.js [20260819_104757]
+ **Fungsi:** Context autentikasi global  
+ **Perubahan:** Tambah fungsi: localUrl; Tambah error handling; Tambah HTTP request  
+ **Lines:** 94-122
+ 
+ ```javascript
+ // Line 91:
+ -       // Network error — fallback ke static key
+ +       // Network error pada server utama — coba login ke server cadangan
+ +       const localUrl = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();
+ +       if (localUrl) {
+ +         try {
+ +           const res2 = await fetch(`${localUrl}/csa/resto/login_x`, {
+ +             method: 'POST',
+ +             headers: {
+ +               'content-type': 'application/json',
+ +               'x-user':     guestUser,
+ +               'x-password': guestPass,
  // ... (truncated)
+ +     // Logout dari server cadangan
+ // Line 220:
+ -     // Bersihkan safety net
+ -     window.sessionStorage.removeItem('local_stale_secretkey');
+ -     window.sessionStorage.removeItem('local_stale_sessionid');
+ -     window.sessionStorage.removeItem('local_stale_userid');
+ - 
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Others
+ 
+ #### 1. ublic/qr-tables.html [20260819_104757]
+ **Fungsi:** Implementasi: qr-tables  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **🔐 Auth/Session:** 1 item
+ - **🔌 API:** 1 item
+ - **⚙️ Others:** 1 item
+ - **Total Files Modified:** 3
+ - **Main Focus:** 🔐 Auth/Session
```

---

### 🔐 Auth/Session

#### 1. src/scripts/contexts/AuthContext.js [20260819_104757]
**Fungsi:** Context autentikasi global  
**Perubahan:** Tambah fungsi: localUrl; Tambah error handling; Tambah HTTP request  
**Lines:** 94-122

```javascript
// Line 91:
-       // Network error — fallback ke static key
+       // Network error pada server utama — coba login ke server cadangan
+       const localUrl = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();
+       if (localUrl) {
+         try {
+           const res2 = await fetch(`${localUrl}/csa/resto/login_x`, {
+             method: 'POST',
+             headers: {
+               'content-type': 'application/json',
+               'x-user':     guestUser,
+               'x-password': guestPass,
+             },
+             body: JSON.stringify({ action: 'login' }),
+             signal: AbortSignal.timeout(10000),
+           });
+           const key2 = res2.headers.get('secretkey');
+           const id2  = res2.headers.get('sessionid');
+           const json2 = await res2.json();
+           if (json2.result === true) {
+             setLoggedIn(true);
+             setUserID(guestUser);
+             setSessionTimeout(false);
+             setSessionKey(key2);
+             setSessionID(id2);
+             if (typeof cb === 'function') cb();
+             return;
+           }
+         } catch (_2) { /* server cadangan juga gagal */ }
+       }
+       // Kedua server gagal — fallback ke static key
```

---

### 🔌 API

#### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260819_104757]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Tambah fungsi: isNetworkError; Tambah error handling; Tambah HTTP request  
**Lines:** 6, 15, 19-31, 38-68, 75-91, 100-116, 138, 147, 161-162, 166, 176, 193, 196, 208

```javascript
// Line 3:
- // URL server lokal sebagai fallback. Kosong = fitur lokal tidak aktif.
+ // URL server cadangan sebagai fallback. Kosong = fitur fallback tidak aktif.
// Line 12:
- // usebrwdef dikontrol via Config.USE_BRWDEF (bukan env — konsisten dengan webcsa-v2)
+ // usebrwdef dikontrol via Config.USE_BRWDEF
+ /**
+  * Helper: cek apakah error adalah network error (server tidak bisa dijangkau)
+  */
+ const isNetworkError = (err) =>
+   err instanceof TypeError ||
+   err instanceof DOMException ||
+   (err && err.name === 'AbortError') ||
+   (err && err.message && (
+     err.message.includes('Failed to fetch') ||
+     err.message.includes('NetworkError') ||
+     err.message.includes('timeout')
+   ));
+ 
+   // ── Generic fetch dengan fallback ke server cadangan ─────────────────────
+   /**
+    * _fetchWithFallback — coba fetch ke URL utama, jika gagal (network) coba ke cadangan.
+    * @param {string} primaryUrl - URL endpoint utama
+    * @param {string} fallbackUrl - URL endpoint cadangan (opsional)
+    * @param {object} options - fetch options (method, headers, body, signal)
  // ... (truncated)
+    * Untuk backward compatibility dengan bqo_payment.js yang sudah pakai ini.
-       throw new Error('Server lokal tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
+       throw new Error('Server cadangan tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
// Line 173:
-     // Login ke server lokal
+     // Login ke server cadangan
// Line 190:
-       throw new Error('Login ke server lokal gagal: ' + (loginJson.onfail?.cerror || 'Unknown error'));
+       throw new Error('Login ke server cadangan gagal: ' + (loginJson.onfail?.cerror || 'Unknown error'));
-     // Safety net — bersihkan jika terjadi crash sebelum logout
-     window.sessionStorage.setItem('local_stale_secretkey', localSessionKey);
-     window.sessionStorage.setItem('local_stale_sessionid', localSessionID);
-     window.sessionStorage.setItem('local_stale_userid',    localUser);
- 
-     // Kirim transaksi ke server lokal
+     // Kirim transaksi ke server cadangan
// Line 205:
-     // Logout dari server lokal
+     // Logout dari server cadangan
// Line 220:
-     // Bersihkan safety net
-     window.sessionStorage.removeItem('local_stale_secretkey');
-     window.sessionStorage.removeItem('local_stale_sessionid');
-     window.sessionStorage.removeItem('local_stale_userid');
- 
```

---

### ⚙️ Others

#### 1. public/qr-tables.html [20260819_104757]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  
**Lines:** 84, 100, 130, 146, 149, 167, 174, 180, 186-213, 221, 227, 262, 265-268, 289, 291-292, 305, 308, 311-312, 322, 335-336, 340-351, 358, 362, 364, 367, 371-382

```javascript
// Line 81:
-       max-width: 640px;
+       max-width: 700px;
// Line 97:
-       min-width: 160px;
+       min-width: 140px;
// Line 127:
-       grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
+       grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
// Line 143:
-     .card.dev-card {
-       border: 2px dashed #e67e22;
-     }
+     .card.dev-card { border: 2px dashed #e67e22; }
-       font-size: 0.65rem;
+       font-size: 0.6rem;
// Line 155:
- 
// Line 164:
-       margin-bottom: 4px;
-       margin-top: 4px;
+       margin: 4px 0;
-       margin-bottom: 12px;
+       margin-bottom: 10px;
-       margin-bottom: 12px;
  // ... (truncated)
+             </div>
+           `;
+         }
+ 
-           <div class="url-text">${url}</div>
+           ${backupHTML}
-         // Generate QR
+         // QR utama — besar
-           text:         url,
+           text:         urlPrimary,
-           colorDark:    isDev ? '#c0390b' : '#222222',  // merah untuk dev, hitam untuk prod
+           colorDark:    isDev ? '#c0390b' : '#222222',
+ 
+         // QR cadangan — kecil
+         if (urlBackup && !isDev) {
+           new QRCode(document.getElementById(`qr-backup-${tableId}`), {
+             text:         urlBackup,
+             width:        80,
+             height:       80,
+             colorDark:    '#666666',
+             colorLight:   '#ffffff',
+             correctLevel: QRCode.CorrectLevel.L,
+           });
+         }
-     // Auto-generate saat halaman load
```

---

#### 2. ublic/qr-tables.html [20260819_105513]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  

---

#### 3. public/vendor/ [20260819_105513]
**Fungsi:** Implementasi: vendor  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **📖 Documentation:** 3 items
- **🔐 Auth/Session:** 1 item
- **🔌 API:** 1 item
- **⚙️ Others:** 3 items
- **Total Files Modified:** 8
- **Main Focus:** 📖 Documentation
