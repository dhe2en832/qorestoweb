# Laporan Kebutuhan API - qorestoweb

**Tanggal**: 24 Juli 2026  
**Project**: qorestoweb  
**File Referensi**: `src/scripts/routes/ApiRoute.js`

---

## 1. Ringkasan Status Endpoint Saat Ini

| Key          | Endpoint                          | Status      |
|--------------|-----------------------------------|-------------|
| `LOGIN_X`    | `/csa/pulauplastik/login_x`       | ✅ Digunakan |
| `BCUST_X`    | `/csa/pulauplastik/bcust_x`       | ✅ Digunakan |
| `BWHSE_X`    | `/csa/pulauplastik/bwhse_x`       | ✅ Digunakan |
| `BSALESP_X`  | `/csa/pulauplastik/bsalesp_x`     | ✅ Digunakan |
| `BSTOCK_X`   | `/csa/pulauplastik/bstock_x`      | ✅ Digunakan |
| `BSO_X`      | `/csa/pulauplastik/bso_x`         | ✅ Digunakan |
| `BITMSO_X`   | `/csa/pulauplastik/bitmso_x`      | ✅ Digunakan |
| `BQO_X`      | `/csa/pulauplastik/bqo_x`         | ✅ Digunakan |

---

## 2. Pemetaan Action yang Digunakan per Endpoint

### `LOGIN_X`
| Action     | Dipanggil di              | Status Frontend |
|------------|---------------------------|-----------------|
| `login`    | `AuthContext.js` (signin) | ✅ Implemented   |
| `logout`   | `AuthContext.js` (signout)| ✅ Implemented   |

### `BCUST_X`
| Action    | Dipanggil di                                  | Status Frontend |
|-----------|-----------------------------------------------|-----------------|
| `getlist` | `useTableListsDynamicResizer` (via lookup)    | ✅ Implemented   |
| `getrec`  | `useLookups`, `bso_form__header`, `bso_list_fast` | ✅ Implemented   |

### `BWHSE_X`
| Action    | Dipanggil di                                 | Status Frontend |
|-----------|----------------------------------------------|-----------------|
| `getlist` | `useTableListsDynamicResizer` (via lookup)   | ✅ Implemented   |
| `getrec`  | `useLookups` (di BSO form header)            | ✅ Implemented   |

### `BSALESP_X`
| Action    | Dipanggil di                                 | Status Frontend |
|-----------|----------------------------------------------|-----------------|
| `getlist` | `useTableListsDynamicResizer` (via lookup)   | ✅ Implemented   |
| `getrec`  | `useLookups` (di BSO form header)            | ✅ Implemented   |

### `BSTOCK_X`
| Action    | Dipanggil di                                 | Status Frontend |
|-----------|----------------------------------------------|-----------------|
| `getlist` | `useTableListsDynamicResizer` (via lookup)   | ✅ Implemented   |
| `getrec`  | `useLookupsItemStock` (di BSO form item)     | ✅ Implemented   |

### `BSO_X`
| Action    | Dipanggil di                      | Status Frontend       |
|-----------|-----------------------------------|-----------------------|
| `getlist` | `bso_list.jsx`, `bso_list_fast.jsx` | ✅ Implemented       |
| `getrec`  | `bso_form.jsx` (mode edit)        | ✅ Implemented        |
| `add`     | `bso_form.jsx` (fast mode)        | ✅ Implemented        |
| `addrec`  | `bso_form__header.jsx`            | ✅ Implemented        |
| `updrec`  | `bso_form.jsx` (mode edit)        | ✅ Implemented        |
| `edit`    | `bso_form.jsx` line ~153          | ⚠️ **DIPANGGIL TAPI TIDAK ADA di bso_api.js** |
| `delrec`  | —                                 | ❌ **BELUM ADA** di frontend maupun bso_api.js |

### `BITMSO_X`
| Action    | Dipanggil di                    | Status Frontend |
|-----------|---------------------------------|-----------------|
| `getlist` | —                               | ✅ Method ada di api, belum dipakai secara eksplisit |
| `getrec`  | —                               | ✅ Method ada di api, belum dipakai secara eksplisit |
| `addrec`  | `bso_form__item.jsx`            | ✅ Implemented   |
| `updrec`  | `bso_form__item.jsx`            | ✅ Implemented   |
| `delrec`  | `bso_form__item.jsx`            | ✅ Implemented   |

### `BQO_X`
| Action    | Dipanggil di                    | Status Frontend |
|-----------|---------------------------------|-----------------|
| `getList` | `bqo_home.js`                   | ✅ Implemented   |
| `add`     | `bqo_checkout.js`               | ✅ Implemented   |

---

## 3. Bug / Ketidakcocokan yang Ditemukan

### 🐛 BUG KRITIS: `bso_api.edit()` dipanggil tapi tidak ada

**Lokasi**: 
- **qorestoweb**: `bso_form.jsx` baris ~153
- **webcsa-v2**: `bso_form.jsx` baris ~238

```javascript
// Di kedua project, kode yang sama:
const fetchOrder =
  mode === 'add' ? await bso_api.add(orderData) : await bso_api.edit(id, orderData);
```

**Masalah**: Method `bso_api.edit()` dipanggil saat `mode === 'edit'` (fast-mode submit), namun method ini **tidak ada** di `bso_api.js` **di kedua project** (qorestoweb maupun webcsa-v2). File `bso_api.js` hanya punya: `getList`, `getRec`, `add`, `addrec`, `updrec`.

**Dampak**: Fitur submit Sales Order dalam mode edit (fast-mode) akan **crash** / error saat digunakan.

**Status Verifikasi**: ✅ **Bug dikonfirmasi ada di 2 project:**
- qorestoweb: `bso_api.js` tidak memiliki method `edit()`
- webcsa-v2 (Pulau Plastik): `bso_api.js` juga tidak memiliki method `edit()`

**Solusi yang Dibutuhkan**:
- Tambah method `edit()` di `bso_api.js` **di kedua project**, atau
- Backend perlu menyediakan action `edit` di endpoint `BSO_X`, atau
- Ganti pemanggilan menjadi `bso_api.updrec()` jika semantiknya sama

---

## 4. Endpoint yang Belum Tersedia (Missing API)

### 4.1 Action `edit` / `updrec` lengkap untuk BSO Header+Items sekaligus

| Komponen       | Kebutuhan                                                   |
|----------------|-------------------------------------------------------------|
| Endpoint       | `BSO_X`                                                     |
| Action         | `edit` (atau versi `updrec` yang menerima header + items)   |
| Dipanggil dari | `bso_form.jsx` saat `mode === 'edit'` dan isFastStateExist  |
| Payload        | `{ soHeaderInfo: {...}, lineItemsInfo: [...] }`             |
| Status         | ❌ **Method `edit()` tidak ada di bso_api.js — berlaku di qorestoweb DAN webcsa-v2** |

---

### 4.2 Delete Sales Order (`BSO_X` → `delrec`)

| Komponen       | Kebutuhan                            |
|----------------|--------------------------------------|
| Endpoint       | `BSO_X`                              |
| Action         | `delrec`                             |
| Dipanggil dari | Belum ada, tapi UI sudah ada tombol Delete di list (disabled) |
| Status         | ❌ **Belum ada di frontend maupun backend** |

**Bukti dari kode**: Di `useTableListsDynamicResizer.js` terdapat kode yang sudah di-comment:
```javascript
// const handleDelete = (event, id) => {
//   ...
//   const deleteDatas = await dataSource.delete(id);
//   ...
// };
```
Dan tombol delete di `columnResize` sudah dirender tapi di-disable:
```javascript
<DeleteElem click={(event) => { }} disabled />
```

---

### 4.3 CRUD Master Data: Customer, Stock, Warehouse, Salesperson

Empat module master data (BCUST, BSTOCK, BWHSE, BSALESP) memiliki **view file yang kosong** (`*_list.js` kosong). Endpoint sudah ada tapi hanya dipakai untuk lookup. Jika kelak diaktifkan sebagai modul mandiri, action berikut akan dibutuhkan:

| Endpoint    | Action yang Kurang            | Keterangan                     |
|-------------|-------------------------------|--------------------------------|
| `BCUST_X`   | `addrec`, `updrec`, `delrec`  | Saat ini hanya `getlist`+`getrec` |
| `BSTOCK_X`  | `addrec`, `updrec`, `delrec`  | Saat ini hanya `getlist`+`getrec` |
| `BWHSE_X`   | `addrec`, `updrec`, `delrec`  | Saat ini hanya `getlist`+`getrec` |
| `BSALESP_X` | `addrec`, `updrec`, `delrec`  | Saat ini hanya `getlist`+`getrec` |

> **Catatan**: Module ini saat ini `active: 'N'` di `ModuleContext.js` (kecuali BSTOCK), sehingga belum ada di routing. Kebutuhan ini bersifat **future/roadmap**.

---

### 4.4 BQO — Status/History Order

| Komponen       | Kebutuhan                                          |
|----------------|----------------------------------------------------|
| Endpoint       | `BQO_X` (atau endpoint baru)                       |
| Action         | `getOrderStatus`, `getHistory`, atau sejenisnya    |
| Alasan         | Setelah checkout berhasil, tidak ada konfirmasi / tracking order untuk pelanggan |
| Status         | ❌ **Belum ada di frontend dan backend**            |

---

### 4.5 BQO — Endpoint Gambar Menu

| Komponen       | Kebutuhan                                              |
|----------------|--------------------------------------------------------|
| Endpoint       | Endpoint gambar / CDN / static files                  |
| Alasan         | Di `bqo_home.js` gambar masih hardcode `Placeholder.png` dari lokal. Field `picture` ada di response data tapi tidak dipakai untuk `<img src>` |
| Bukti kode     | `<img src={Placeholder} .../>` — bukan `data.picture` |
| Status         | ❌ **Backend endpoint gambar belum dikonsumsi**        |

---

## 5. Ringkasan Prioritas

| Prioritas | Kebutuhan                           | Endpoint   | Tipe          |
|-----------|-------------------------------------|------------|---------------|
| 🔴 KRITIS  | `bso_api.edit()` — method hilang    | `BSO_X`    | Bug / Fix     |
| 🟠 TINGGI  | Action `edit` lengkap BSO di backend| `BSO_X`    | Action baru   |
| 🟠 TINGGI  | Action `delrec` untuk BSO           | `BSO_X`    | Action baru   |
| 🟡 SEDANG  | BQO order status/history            | `BQO_X`    | Action baru   |
| 🟡 SEDANG  | BQO endpoint gambar menu dikonsumsi | `BQO_X`    | Frontend fix  |
| 🟢 RENDAH  | CRUD master BCUST, BSTOCK, BWHSE, BSALESP | Semua  | Future roadmap |

---

## 6. Rekomendasi Tindakan

### Segera (Kritis)
1. **Tambah method `edit` di `bso_api.js`**:
   ```javascript
   static async edit(id, data) {
     return this.fetching('edit', { key: id, ...data });
     // atau sesuai kontrak API backend
   }
   ```
2. **Konfirmasi ke backend** apakah action `edit` di `BSO_X` sudah tersedia, atau apakah `updrec` bisa dipakai untuk update header+items sekaligus.

### Jangka Pendek
3. Tambah action `delrec` di `BSO_X` (frontend + backend) agar tombol delete di list bisa diaktifkan.
4. Perbaiki `bqo_home.js` agar menggunakan `data.picture` dari API, bukan hardcode placeholder.
5. Tambah endpoint/action untuk tracking status order BQO.

### Jangka Panjang (Roadmap)
6. Lengkapi action CRUD untuk semua master data (BCUST, BSTOCK, BWHSE, BSALESP) saat module-module tersebut diaktifkan.

---

*Laporan ini dibuat berdasarkan analisis statis kode sumber project qorestoweb.*
