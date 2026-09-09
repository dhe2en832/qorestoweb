# Code Changes Summary

## 9 September 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260909_130551]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  
**Lines:** 160-161, 918-922, 933

```javascript
// Line 157:
+   const inputPhoneRef = useRef();
+ 
// Line 915:
+                 onKeyDown={(e) => {
+                   if (e.key === 'Enter') {
+                     inputPhoneRef.current && inputPhoneRef.current.focus();
+                   }
+                 }}
// Line 930:
+                 inputRef={inputPhoneRef}
```

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260909.md [20260909_131025]
**Fungsi:** Implementasi: codeChange-20260909  
**Perubahan:** Tambah state management; Tambah side effect  
**Lines:** 7, 10-79, 108-115, 118, 120-121

```javascript
// Line 4:
- #### 1. rc/scripts/modules/BQO/views/bqo_checkout.js [20260909_130551]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260909_130551]
+ **Lines:** 160-161, 918-922, 933
+ 
+ ```javascript
+ // Line 157:
+ +   const inputPhoneRef = useRef();
+ + 
+ // Line 915:
+ +                 onKeyDown={(e) => {
+ +                   if (e.key === 'Enter') {
+ +                     inputPhoneRef.current && inputPhoneRef.current.focus();
+ +                   }
+ +                 }}
+ // Line 930:
+ +                 inputRef={inputPhoneRef}
+ ```
+ 
+ ---
+ 
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260909.md [20260909_130551]
+ **Fungsi:** Implementasi: codeChange-20260909  
  // ... (truncated)
+ + // Line 124:
+ + +                 inputRef={inputPasswordRef}
+ + ```
+ + 
+ + ---
+ + 
+ + ## 📊 **Summary**
+ + - **✨ Features:** 1 item
+ + - **🔐 Auth/Session:** 1 item
+ + - **Total Files Modified:** 2
+ + - **Main Focus:** Features
+ ```
// Line 105:
+ ### ⚙️ Others
+ 
+ #### 1. ublic/app.cfg.cadangan [20260909_131024]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ - **📖 Documentation:** 1 item
- - **Total Files Modified:** 2
+ - **⚙️ Others:** 1 item
+ - **Total Files Modified:** 4
```

---

#### 2. docs/changelog/daily/codeChange-20260909.md [20260909_130551]
**Fungsi:** Implementasi: codeChange-20260909  
**Perubahan:** Tambah state management; Tambah side effect  
**Lines:** 1-42

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 9 September 2026
+ 
+ ### ✨ Features
+ 
+ #### 1. rc/scripts/modules/BQO/views/bqo_checkout.js [20260909_130551]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ ### 🔐 Auth/Session
+ 
+ #### 1. src/scripts/modules/LOGIN/index.js [20260909_130551]
+ **Fungsi:** Entry point / registrasi React  
+ **Perubahan:** Import: react; Tambah state management; Tambah side effect  
+ **Lines:** 1, 32, 113-117, 127
+ 
+ ```javascript
+ // Line 1:
+ - import React, { useState, useEffect } from 'react';
+ + import React, { useState, useEffect, useRef } from 'react';
+ // Line 29:
+ +   const inputPasswordRef = useRef();
+ // Line 110:
+ +                 onKeyDown={(e) => {
+ +                   if (e.key === 'Enter') {
+ +                     inputPasswordRef.current && inputPasswordRef.current.focus();
+ +                   }
+ +                 }}
+ // Line 124:
+ +                 inputRef={inputPasswordRef}
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **✨ Features:** 1 item
+ - **🔐 Auth/Session:** 1 item
+ - **Total Files Modified:** 2
+ - **Main Focus:** Features
```

---

### 🔐 Auth/Session

#### 1. src/scripts/modules/LOGIN/index.js [20260909_130551]
**Fungsi:** Entry point / registrasi React  
**Perubahan:** Import: react; Tambah state management; Tambah side effect  
**Lines:** 1, 32, 113-117, 127

```javascript
// Line 1:
- import React, { useState, useEffect } from 'react';
+ import React, { useState, useEffect, useRef } from 'react';
// Line 29:
+   const inputPasswordRef = useRef();
// Line 110:
+                 onKeyDown={(e) => {
+                   if (e.key === 'Enter') {
+                     inputPasswordRef.current && inputPasswordRef.current.focus();
+                   }
+                 }}
// Line 124:
+                 inputRef={inputPasswordRef}
```

---

### ⚙️ Others

#### 1. public/app.cfg.cadangan [20260909_131025]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 15-19

```javascript
// Line 12:
-   "show_tunai_button": false
+   "show_tunai_button": false,
+ 
+   "tax_mode": "EXCLUSIVE",
+   "tax_rate": 12,
+   "tax_effective_rate": "11/12"
```

---

## 📊 **Summary**
- **✨ Features:** 1 item
- **📖 Documentation:** 2 items
- **🔐 Auth/Session:** 1 item
- **⚙️ Others:** 1 item
- **Total Files Modified:** 5
- **Main Focus:** 📖 Documentation
