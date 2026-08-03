# Code Changes Summary

## 3 Agustus 2026

### ⚙️ Config

#### 1. nv/qorestoweb/.env [20260803_100852]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  

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

## 📊 **Summary**
- **⚙️ Config:** 5 items
- **⚙️ Others:** 2 items
- **Total Files Modified:** 7
- **Main Focus:** ⚙️ Config
