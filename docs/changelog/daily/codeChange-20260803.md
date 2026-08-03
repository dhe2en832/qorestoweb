# Code Changes Summary

## 3 Agustus 2026

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260803.md [20260803_103423]
**Fungsi:** Implementasi: codeChange-20260803  
**Perubahan:** Tambah state management; Tambah side effect  
**Lines:** 7-68, 129, 289-314, 326, 340, 354, 361, 364-365

```javascript
// Line 4:
- #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_101418]
+ #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_102027]
+ **Fungsi:** Implementasi: codeChange-20260803  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 7-68, 131, 133-148, 228-240, 254, 268, 275, 278-279
+ 
+ ```javascript
+ // Line 4:
+ - #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_100852]
+ + #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_101418]
+ + **Fungsi:** Implementasi: codeChange-20260803  
+ + **Perubahan:** Pembaruan kode  
+ + **Lines:** 5-75, 78, 81-90, 180-191, 193-194, 196-197
+ + 
+ + ```javascript
+ + // Line 2:
+ + + ### 📖 Documentation
+ + + 
+ + + #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_100852]
+ + + **Fungsi:** Implementasi: codeChange-20260803  
+ + + **Perubahan:** Pembaruan kode  
+ + + **Lines:** 1-103
+ + + 
+ + + ```javascript
  // ... (truncated)
+ +     loadAppConfig().finally(() => setConfigReady(true));
+ +   }, []);
+ + 
+ +   if (!configReady) return <ProgressLoader />;
+ + 
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/utils/app-config.js [20260803_101418]
// Line 323:
- #### 2. public/app.cfg [20260803_100852]
+ #### 3. public/app.cfg [20260803_100852]
// Line 337:
- #### 3. public/app.cfg.cadangan [20260803_100852]
+ #### 4. public/app.cfg.cadangan [20260803_100852]
// Line 351:
- #### 4. rc/scripts/App.js [20260803_102026]
+ #### 5. rc/scripts/utils/app-config.js [20260803_103422]
- - **📖 Documentation:** 2 items
+ - **📖 Documentation:** 3 items
- - **⚙️ Others:** 4 items
- - **Total Files Modified:** 12
+ - **⚙️ Others:** 5 items
+ - **Total Files Modified:** 14
```

---

#### 2. docs/changelog/daily/codeChange-20260803.md [20260803_102027]
**Fungsi:** Implementasi: codeChange-20260803  
**Perubahan:** Pembaruan kode  
**Lines:** 7-68, 131, 133-148, 228-240, 254, 268, 275, 278-279

```javascript
// Line 4:
- #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_100852]
+ #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_101418]
+ **Fungsi:** Implementasi: codeChange-20260803  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 5-75, 78, 81-90, 180-191, 193-194, 196-197
+ 
+ ```javascript
+ // Line 2:
+ + ### 📖 Documentation
+ + 
+ + #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_100852]
+ + **Fungsi:** Implementasi: codeChange-20260803  
+ + **Perubahan:** Pembaruan kode  
+ + **Lines:** 1-103
+ + 
+ + ```javascript
+ + // Line 1:
+ + + # Code Changes Summary
+ + + 
+ + + ## 3 Agustus 2026
+ + + 
+ + + ### ⚙️ Config
+ + + 
+ + + #### 1. nv/qorestoweb/.env [20260803_100852]
  // ... (truncated)
+ // Line 20:
+ +   use_mock_bqo:                  false, // true = pakai data mock (tanpa backend)
+ ```
+ 
+ ---
+ 
+ #### 2. public/app.cfg [20260803_100852]
// Line 251:
- #### 2. public/app.cfg.cadangan [20260803_100852]
+ #### 3. public/app.cfg.cadangan [20260803_100852]
// Line 265:
- #### 3. src/scripts/utils/app-config.js [20260803_101418]
+ #### 4. rc/scripts/App.js [20260803_102026]
- **Lines:** 23
- 
- ```javascript
- // Line 20:
- +   use_mock_bqo:                  false, // true = pakai data mock (tanpa backend)
- ```
- - **📖 Documentation:** 1 item
+ - **📖 Documentation:** 2 items
- - **⚙️ Others:** 3 items
- - **Total Files Modified:** 10
+ - **⚙️ Others:** 4 items
+ - **Total Files Modified:** 12
```

---

#### 3. docs/changelog/daily/codeChange-20260803.md [20260803_101418]
**Fungsi:** Implementasi: codeChange-20260803  
**Perubahan:** Pembaruan kode  
**Lines:** 5-75, 78, 81-90, 180-191, 193-194, 196-197

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260803.md [20260803_100852]
+ **Fungsi:** Implementasi: codeChange-20260803  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 1-103
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 3 Agustus 2026
+ + 
+ + ### ⚙️ Config
+ + 
+ + #### 1. nv/qorestoweb/.env [20260803_100852]
+ + **Fungsi:** Implementasi: .env  
+ + **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ + 
+ + ---
+ + 
+ + #### 2. env/qorestoweb/.env.dev [20260803_100852]
+ + **Fungsi:** Implementasi: .env  
+ + **Perubahan:** Ubah konfigurasi environment / API endpoint  
  // ... (truncated)
+ - # Mock BQO backend — default OFF, di-override per mode
+ - # Y = aktif (dev/qa), N = mati (production)
+ - REACT_APP_USE_MOCK_BQO=N
+ + # Mock BQO backend — dikontrol via public/app.cfg (use_mock_bqo)
+ + # Tidak perlu di-set di sini, runtime config lebih fleksibel
+ ```
// Line 177:
+ #### 3. src/scripts/utils/app-config.js [20260803_101418]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 23
+ 
+ ```javascript
+ // Line 20:
+ +   use_mock_bqo:                  false, // true = pakai data mock (tanpa backend)
+ ```
+ 
+ ---
+ 
+ - **📖 Documentation:** 1 item
+ - **🔌 API:** 1 item
- - **⚙️ Others:** 2 items
- - **Total Files Modified:** 7
+ - **⚙️ Others:** 3 items
+ - **Total Files Modified:** 10
```

---

#### 4. docs/changelog/daily/codeChange-20260803.md [20260803_100852]
**Fungsi:** Implementasi: codeChange-20260803  
**Perubahan:** Pembaruan kode  
**Lines:** 1-103

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 3 Agustus 2026
+ 
+ ### ⚙️ Config
+ 
+ #### 1. nv/qorestoweb/.env [20260803_100852]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ 
+ ---
+ 
+ #### 2. env/qorestoweb/.env.dev [20260803_100852]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ **Lines:** 20
+ 
+ ```javascript
+ // Line 17:
+ - # Mock — aktif di development (bqo_x belum siap di backend)
+ - REACT_APP_USE_MOCK_BQO=Y
+ + # Mock — dikontrol via public/app.cfg (use_mock_bqo: true/false)
+ ```
+ 
  // ... (truncated)
+ +   "xendit_show_simulate": true,
+ +   "use_mock_bqo": false
+ ```
+ 
+ ---
+ 
+ #### 2. public/app.cfg.cadangan [20260803_100852]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 8-9
+ 
+ ```javascript
+ // Line 5:
+ -   "xendit_show_simulate": false
+ +   "xendit_show_simulate": false,
+ +   "use_mock_bqo": false
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **⚙️ Config:** 5 items
+ - **⚙️ Others:** 2 items
+ - **Total Files Modified:** 7
+ - **Main Focus:** ⚙️ Config
```

---

### 🔌 API

#### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260803_101418]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Import: app-config  
**Lines:** 4, 11-13

```javascript
// Line 1:
+ import { getAppConfig } from '../../../utils/app-config';
- // Aktifkan mock hanya saat REACT_APP_USE_MOCK_BQO=Y (development only)
- const USE_MOCK = process.env.REACT_APP_USE_MOCK_BQO === 'Y';
- 
-     // ── MOCK MODE ───────────────────────────────────────────────────────────
-     if (USE_MOCK) {
+     // ── MOCK MODE — dibaca dari app.cfg (runtime, tanpa rebuild) ────────────
+     const useMock = getAppConfig().use_mock_bqo === true;
+     if (useMock) {
-         // Teruskan error agar perilaku network-error tetap bisa diuji
```

---

#### 2. rc/scripts/modules/BQO/controllers/bqo_api.js [20260803_104119]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Config

#### 1. env/qorestoweb/.env [20260803_100852]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 21-22

```javascript
// Line 18:
- # Mock BQO backend — default OFF, di-override per mode
- # Y = aktif (dev/qa), N = mati (production)
- REACT_APP_USE_MOCK_BQO=N
+ # Mock BQO backend — dikontrol via public/app.cfg (use_mock_bqo)
+ # Tidak perlu di-set di sini, runtime config lebih fleksibel
```

---

#### 2. env/qorestoweb/.env.dev [20260803_100852]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 20

```javascript
// Line 17:
- # Mock — aktif di development (bqo_x belum siap di backend)
- REACT_APP_USE_MOCK_BQO=Y
+ # Mock — dikontrol via public/app.cfg (use_mock_bqo: true/false)
```

---

#### 3. env/qorestoweb/.env.prod [20260803_100852]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 20

```javascript
// Line 17:
- # Mock — SELALU OFF di production
- REACT_APP_USE_MOCK_BQO=N
+ # Mock — dikontrol via public/app.cfg (use_mock_bqo: false di production)
```

---

#### 4. env/qorestoweb/.env.prod.cadangan [20260803_100852]
**Fungsi:** Implementasi: .env.prod  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 22

```javascript
// Line 19:
- # Mock — SELALU OFF di production
- REACT_APP_USE_MOCK_BQO=N
+ # Mock — dikontrol via public/app.cfg (use_mock_bqo: false di production)
```

---

#### 5. env/qorestoweb/.env.qa [20260803_100852]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 18

```javascript
// Line 15:
- # Mock — aktif di qa
- REACT_APP_USE_MOCK_BQO=Y
+ # Mock — dikontrol via public/app.cfg (use_mock_bqo: true/false)
```

---

### ⚙️ Others

#### 1. src/scripts/utils/app-config.js [20260803_103423]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Tambah fungsi: _publicUrl  
**Lines:** 12, 14

```javascript
// Line 9:
+ const _publicUrl = (process.env.PUBLIC_URL || '/').replace(/\/?$/, '/');
-   window.location.origin + (process.env.PUBLIC_URL || '/') + APP_CONFIG_FILENAME;
+   window.location.origin + _publicUrl + APP_CONFIG_FILENAME;
```

---

#### 2. src/scripts/App.js [20260803_102027]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Import: app-config  
**Lines:** 1, 11, 19-27

```javascript
// Line 1:
- import React, { useRef, lazy, Suspense } from 'react';
+ import React, { useRef, lazy, Suspense, useState, useEffect } from 'react';
// Line 8:
+ import { loadAppConfig } from './utils/app-config';
// Line 16:
+   const [configReady, setConfigReady] = useState(false);
+ 
+   // Load app.cfg sekali saat app pertama mount — blok render sampai selesai
+   useEffect(() => {
+     loadAppConfig().finally(() => setConfigReady(true));
+   }, []);
+ 
+   if (!configReady) return <ProgressLoader />;
+ 
```

---

#### 3. src/scripts/utils/app-config.js [20260803_101418]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 23

```javascript
// Line 20:
+   use_mock_bqo:                  false, // true = pakai data mock (tanpa backend)
```

---

#### 4. public/app.cfg [20260803_100852]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 8-9

```javascript
// Line 5:
-   "xendit_show_simulate": true
+   "xendit_show_simulate": true,
+   "use_mock_bqo": false
```

---

#### 5. public/app.cfg.cadangan [20260803_100852]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 8-9

```javascript
// Line 5:
-   "xendit_show_simulate": false
+   "xendit_show_simulate": false,
+   "use_mock_bqo": false
```

---

## 📊 **Summary**
- **📖 Documentation:** 4 items
- **🔌 API:** 2 items
- **⚙️ Config:** 5 items
- **⚙️ Others:** 5 items
- **Total Files Modified:** 16
- **Main Focus:** ⚙️ Config
