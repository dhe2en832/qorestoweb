# Code Changes Summary

## 11 Agustus 2026

### ✨ Features

#### 1. rc/scripts/modules/BQO/views/bqo_checkout.js [20260811_082355]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Pembaruan kode  

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

## 📊 **Summary**
- **✨ Features:** 2 items
- **Total Files Modified:** 2
- **Main Focus:** Features
