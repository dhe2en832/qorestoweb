# Code Changes Summary

## 19 Agustus 2026

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

#### 1. ublic/qr-tables.html [20260819_104757]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **🔐 Auth/Session:** 1 item
- **🔌 API:** 1 item
- **⚙️ Others:** 1 item
- **Total Files Modified:** 3
- **Main Focus:** 🔐 Auth/Session
