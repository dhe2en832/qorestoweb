# Code Changes Summary

## 11 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260811_083419]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Tambah fungsi: handleOnCheckout  
**Lines:** 1, 159, 204, 351, 364-369

```javascript
// Line 1:
- import React, { useState, useEffect } from 'react';
+ import React, { useState, useEffect, useRef } from 'react';
// Line 156:
+   const occupiedTablesRef = useRef(new Set()); // ref untuk cek sinkron setelah fetch
// Line 201:
+         occupiedTablesRef.current = occupied; // update ref sinkron untuk cek race condition
// Line 348:
-   const handleOnCheckout = () => {
+   const handleOnCheckout = async () => {
-     if (occupiedTables.has(info.seatNumber)) {
-       ToastBar('error', `Meja ${info.seatNumber} sedang terisi. Pilih meja lain.`, 4000);
-       return;
-     }
// Line 361:
+     // Refresh data meja tepat sebelum submit — cegah race condition antar device
+     await fetchOccupiedTables();
+     if (occupiedTablesRef.current.has(info.seatNumber)) {
+       ToastBar('error', `Meja ${info.seatNumber} baru saja dipesan orang lain. Pilih meja lain.`, 4000);
+       return;
+     }
```

---

#### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260811_082355]
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

#### 3. src/scripts/modules/BQO/views/bqo_home.js [20260811_082355]
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

#### 4. src/scripts/modules/BQO/views/bqo_checkout.js [20260811_111513]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: table-session; Tambah error handling  
**Lines:** 36, 142, 144, 147-151, 153, 156-158, 663-696, 698-710

```javascript
// Line 33:
+ import { getTableId } from '../../../utils/table-session';
// Line 139:
+   // seatNumber diisi otomatis dari URL ?table=XX jika tersedia
+     const tableFromUrl = getTableId();
-       try { return JSON.parse(saved); } catch (_) {}
+       try {
+         const parsed = JSON.parse(saved);
+         // Override seatNumber dengan nilai dari URL jika ada
+         return { ...parsed, seatNumber: tableFromUrl || parsed.seatNumber };
+       } catch (_) {}
-     return { seatNumber: '', orderByName: '', phoneNumber: '' };
+     return { seatNumber: tableFromUrl, orderByName: '', phoneNumber: '' };
+   // Apakah nomor meja dikunci (dari URL parameter)
+   const isTableLocked = getTableId() !== '';
+ 
// Line 660:
-               <TextField
-                 select
-                 size="small"
-                 variant="standard"
-                 label={loadingTables ? 'Memuat meja...' : 'No. Meja'}
-                 name="seatNumber"
-                 value={info.seatNumber}
-                 onChange={handleChangeInfo}
  // ... (truncated)
+                   helperText={
+                     info.seatNumber && occupiedTables.has(info.seatNumber)
+                       ? '⚠️ Meja ini sedang terisi. Pilih meja lain.'
+                       : ''
+                   }
+                   FormHelperTextProps={{ sx: { color: 'warning.main' } }}
+                   sx={{ minWidth: 160 }}
+                 >
+                   <MenuItem value="" disabled>
+                     <em>— Pilih Nomor Meja —</em>
-                 ))}
-               </TextField>
+                   {tableOptions.map((opt) => (
+                     <MenuItem
+                       key={opt.value}
+                       value={opt.value}
+                       disabled={opt.occupied}
+                       sx={opt.occupied ? { color: '#aaa' } : {}}
+                     >
+                       {opt.label}
+                       {opt.occupied ? ' (Terisi)' : ''}
+                     </MenuItem>
+                   ))}
+                 </TextField>
+               )}
```

---

#### 5. src/scripts/modules/BQO/views/bqo_home.js [20260811_111513]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: TableRestaurant; Import: table-session  
**Lines:** 21-22, 410, 421, 435-442

```javascript
// Line 18:
+ import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
+ import { getTableId } from '../../../utils/table-session';
// Line 407:
-             <Grid container justifyContent="space-between">
+             <Grid container justifyContent="space-between" alignItems="center">
// Line 418:
-               <Grid item xs={11}>
+               <Grid item xs={getTableId() ? 7 : 11}>
// Line 432:
+               {getTableId() && (
+                 <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1 }}>
+                   <TableRestaurantIcon sx={{ color: '#3f50b5', fontSize: 18, mr: 0.5 }} />
+                   <Typography variant="body2" fontWeight={600} color="#3f50b5" noWrap>
+                     Meja {getTableId()}
+                   </Typography>
+                 </Grid>
+               )}
```

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260811.md [20260811_083419]
**Fungsi:** Implementasi: codeChange-20260811  
**Perubahan:** Ubah render/return JSX  
**Lines:** 7, 9-21, 49-107, 109-111

```javascript
// Line 4:
- #### 1. rc/scripts/modules/BQO/views/bqo_checkout.js [20260811_082355]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260811_082355]
- **Perubahan:** Pembaruan kode  
+ **Perubahan:** Ubah render/return JSX  
+ **Lines:** 215-220
+ 
+ ```javascript
+ // Line 212:
+ -     return () => window.removeEventListener('focus', fetchOccupiedTables);
+ +     // Polling setiap 15 detik agar data meja selalu sinkron antar device
+ +     const intervalId = setInterval(fetchOccupiedTables, 15000);
+ +     return () => {
+ +       window.removeEventListener('focus', fetchOccupiedTables);
+ +       clearInterval(intervalId);
+ +     };
+ ```
// Line 46:
+ #### 3. rc/scripts/modules/BQO/views/bqo_checkout.js [20260811_083419]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ ### 📖 Documentation
  // ... (truncated)
+ + +     const keyword = (event.target.value || '').trim();
+ + -     const resJson = await getDatas();
+ + +     const resJson = await getDatas({ query: { freefilter: { search: '!LDISCONT' }, textfilter: { search: keyword } } });
+ + -     const datasFilter = resJson.datas.filter((data) => data.name.includes(event.target.value));
+ + +     // Fallback filter client-side jika backend tidak support textfilter
+ + +     const datasFilter = keyword
+ + +       ? resJson.datas.filter((data) => data.name.toLowerCase().includes(keyword.toLowerCase()))
+ + +       : resJson.datas;
+ + ```
+ + 
+ + ---
+ + 
+ + ## 📊 **Summary**
+ + - **✨ Features:** 2 items
+ + - **Total Files Modified:** 2
+ + - **Main Focus:** Features
+ ```
+ 
+ ---
+ 
- - **✨ Features:** 2 items
- - **Total Files Modified:** 2
+ - **✨ Features:** 3 items
+ - **📖 Documentation:** 1 item
+ - **Total Files Modified:** 4
```

---

#### 2. docs/changelog/daily/codeChange-20260811.md [20260811_082355]
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

#### 3. docs/perubahan.md [20260811_111513]
**Fungsi:** Implementasi: perubahan  
**Perubahan:** Pembaruan kode  

---

### 🔐 Auth/Session

#### 1. src/scripts/utils/table-session.js [20260811_111513]
**Fungsi:** Utility: table-session  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Others

#### 1. rc/scripts/App.js [20260811_111513]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **✨ Features:** 5 items
- **📖 Documentation:** 3 items
- **🔐 Auth/Session:** 1 item
- **⚙️ Others:** 1 item
- **Total Files Modified:** 10
- **Main Focus:** Features
