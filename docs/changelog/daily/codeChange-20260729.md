# Code Changes Summary

## 29 Juli 2026

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260729.md [20260729_104543]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Pembaruan kode  
**Lines:** 1-46

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 29 Juli 2026
+ 
+ ### 🔌 API
+ 
+ #### 1. src/scripts/routes/ApiRoute.js [20260729_104543]
+ **Fungsi:** Route: ApiRoute  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 4-11
+ 
+ ```javascript
+ // Line 1:
+ -   LOGIN_X: `${Config.BASE_URL}/csa/pulauplastik/login_x`,
+ -   BCUST_X: `${Config.BASE_URL}/csa/pulauplastik/bcust_x`,
+ -   BWHSE_X: `${Config.BASE_URL}/csa/pulauplastik/bwhse_x`,
+ -   BSALESP_X: `${Config.BASE_URL}/csa/pulauplastik/bsalesp_x`,
+ -   BSTOCK_X: `${Config.BASE_URL}/csa/pulauplastik/bstock_x`,
+ -   BSO_X: `${Config.BASE_URL}/csa/pulauplastik/bso_x`,
+ -   BITMSO_X: `${Config.BASE_URL}/csa/pulauplastik/bitmso_x`,
+ -   BQO_X: `${Config.BASE_URL}/csa/pulauplastik/bqo_x`,
+ +   LOGIN_X: `${Config.BASE_URL}/csa/resto/login_x`,
+ +   BCUST_X: `${Config.BASE_URL}/csa/resto/bcust_x`,
+ +   BWHSE_X: `${Config.BASE_URL}/csa/resto/bwhse_x`,
+ +   BSALESP_X: `${Config.BASE_URL}/csa/resto/bsalesp_x`,
+ +   BSTOCK_X: `${Config.BASE_URL}/csa/resto/bstock_x`,
+ +   BSO_X: `${Config.BASE_URL}/csa/resto/bso_x`,
+ +   BITMSO_X: `${Config.BASE_URL}/csa/resto/bitmso_x`,
+ +   BQO_X: `${Config.BASE_URL}/csa/resto/bqo_x`,
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Others
+ 
+ #### 1. env-cmdrc [20260729_104543]
+ **Fungsi:** Implementasi: env-cmdrc  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **🔌 API:** 1 item
+ - **⚙️ Others:** 1 item
+ - **Total Files Modified:** 2
+ - **Main Focus:** 🔌 API
```

---

### 🔌 API

#### 1. src/scripts/routes/ApiRoute.js [20260729_104543]
**Fungsi:** Route: ApiRoute  
**Perubahan:** Pembaruan kode  
**Lines:** 4-11

```javascript
// Line 1:
-   LOGIN_X: `${Config.BASE_URL}/csa/pulauplastik/login_x`,
-   BCUST_X: `${Config.BASE_URL}/csa/pulauplastik/bcust_x`,
-   BWHSE_X: `${Config.BASE_URL}/csa/pulauplastik/bwhse_x`,
-   BSALESP_X: `${Config.BASE_URL}/csa/pulauplastik/bsalesp_x`,
-   BSTOCK_X: `${Config.BASE_URL}/csa/pulauplastik/bstock_x`,
-   BSO_X: `${Config.BASE_URL}/csa/pulauplastik/bso_x`,
-   BITMSO_X: `${Config.BASE_URL}/csa/pulauplastik/bitmso_x`,
-   BQO_X: `${Config.BASE_URL}/csa/pulauplastik/bqo_x`,
+   LOGIN_X: `${Config.BASE_URL}/csa/resto/login_x`,
+   BCUST_X: `${Config.BASE_URL}/csa/resto/bcust_x`,
+   BWHSE_X: `${Config.BASE_URL}/csa/resto/bwhse_x`,
+   BSALESP_X: `${Config.BASE_URL}/csa/resto/bsalesp_x`,
+   BSTOCK_X: `${Config.BASE_URL}/csa/resto/bstock_x`,
+   BSO_X: `${Config.BASE_URL}/csa/resto/bso_x`,
+   BITMSO_X: `${Config.BASE_URL}/csa/resto/bitmso_x`,
+   BQO_X: `${Config.BASE_URL}/csa/resto/bqo_x`,
```

---

### ⚙️ Config

#### 1. .env-cmdrc [20260729_104543]
**Fungsi:** Implementasi: .env-cmdrc  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 19

```javascript
// Line 16:
-         "REACT_APP_API_ENDPOINT": "https://csacomputer.ddns.net/api",
+          "REACT_APP_API_ENDPOINT": "http://192.168.100.13/api",
```

---

## 📊 **Summary**
- **📖 Documentation:** 1 item
- **🔌 API:** 1 item
- **⚙️ Config:** 1 item
- **Total Files Modified:** 3
- **Main Focus:** 📖 Documentation
