# Code Changes Summary

## 3 Agustus 2026

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260803.md [20260803_100852]
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

#### 1. rc/scripts/modules/BQO/controllers/bqo_api.js [20260803_101418]
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

#### 1. public/app.cfg [20260803_100852]
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

#### 2. public/app.cfg.cadangan [20260803_100852]
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

#### 3. src/scripts/utils/app-config.js [20260803_101418]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 23

```javascript
// Line 20:
+   use_mock_bqo:                  false, // true = pakai data mock (tanpa backend)
```

---

## 📊 **Summary**
- **📖 Documentation:** 1 item
- **🔌 API:** 1 item
- **⚙️ Config:** 5 items
- **⚙️ Others:** 3 items
- **Total Files Modified:** 10
- **Main Focus:** ⚙️ Config
