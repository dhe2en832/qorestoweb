# Code Changes Summary

## 11 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260811_082355]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Ubah render/return JSX  
**Lines:** 215-220

```javascript
// Line 212:
-     return () => window.removeEventListener('focus', fetchOccupiedTables);
+     // Polling setiap 15 detik agar data meja selalu sinkron antar device
+     const intervalId = setInterval(fetchOccupiedTables, 15000);
+     return () => {
+       window.removeEventListener('focus', fetchOccupiedTables);
+       clearInterval(intervalId);
+     };
```

---

#### 2. src/scripts/modules/BQO/views/bqo_home.js [20260811_082355]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Tambah fungsi: getDatas; Tambah fungsi: keyword  
**Lines:** 106, 108, 238, 240, 243-246

```javascript
// Line 103:
-   async function getDatas() {
+   async function getDatas(overrides = {}) {
-     const res = await bqo_api.getList({});
+     const res = await bqo_api.getList(overrides);
// Line 235:
+     const keyword = (event.target.value || '').trim();
-     const resJson = await getDatas();
+     const resJson = await getDatas({ query: { freefilter: { search: '!LDISCONT' }, textfilter: { search: keyword } } });
-     const datasFilter = resJson.datas.filter((data) => data.name.includes(event.target.value));
+     // Fallback filter client-side jika backend tidak support textfilter
+     const datasFilter = keyword
+       ? resJson.datas.filter((data) => data.name.toLowerCase().includes(keyword.toLowerCase()))
+       : resJson.datas;
```

---

#### 3. rc/scripts/modules/BQO/views/bqo_checkout.js [20260811_083419]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260811.md [20260811_082355]
**Fungsi:** Implementasi: codeChange-20260811  
**Perubahan:** Pembaruan kode  
**Lines:** 1-40

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 11 Agustus 2026
+ 
+ ### ✨ Features
+ 
+ #### 1. rc/scripts/modules/BQO/views/bqo_checkout.js [20260811_082355]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_home.js [20260811_082355]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Tambah fungsi: getDatas; Tambah fungsi: keyword  
+ **Lines:** 106, 108, 238, 240, 243-246
+ 
+ ```javascript
+ // Line 103:
+ -   async function getDatas() {
+ +   async function getDatas(overrides = {}) {
+ -     const res = await bqo_api.getList({});
+ +     const res = await bqo_api.getList(overrides);
+ // Line 235:
+ +     const keyword = (event.target.value || '').trim();
+ -     const resJson = await getDatas();
+ +     const resJson = await getDatas({ query: { freefilter: { search: '!LDISCONT' }, textfilter: { search: keyword } } });
+ -     const datasFilter = resJson.datas.filter((data) => data.name.includes(event.target.value));
+ +     // Fallback filter client-side jika backend tidak support textfilter
+ +     const datasFilter = keyword
+ +       ? resJson.datas.filter((data) => data.name.toLowerCase().includes(keyword.toLowerCase()))
+ +       : resJson.datas;
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **✨ Features:** 2 items
+ - **Total Files Modified:** 2
+ - **Main Focus:** Features
```

---

## 📊 **Summary**
- **✨ Features:** 3 items
- **📖 Documentation:** 1 item
- **Total Files Modified:** 4
- **Main Focus:** Features
