# Code Changes Summary

## 20 Agustus 2026

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260820.md [20260820_131534]
**Fungsi:** Implementasi: codeChange-20260820  
**Perubahan:** Akses localStorage  
**Lines:** 7, 9-98, 104-106

```javascript
// Line 4:
- #### 1. ocs/ALUR-QORESTOWEB.md [20260820_104133]
+ #### 1. docs/ALUR-QORESTOWEB.md [20260820_104133]
+ **Perubahan:** Akses localStorage  
+ **Lines:** 1, 7-8, 15-16, 26-27, 44, 81-82, 88, 93, 96-103, 125-130, 132-134, 138-145, 150-152, 155-157, 160-161, 163-165, 170-173, 177, 181-182, 194, 197, 199, 205, 210-211, 213, 215, 219-220, 229-233, 239, 243-251, 254, 256, 260-272, 276-292, 294-345, 349, 358-361, 366, 370-392, 397, 399-419, 421, 423, 425-468
+ 
+ ```javascript
+ // Line 1:
+ - # Alur Lengkap Qorestoweb — Self-Order Restoran via QR Code
+ + # Dokumentasi Lengkap Qorestoweb — Self-Order Restoran via QR Code
+ + **Tech Stack:** React (CRA), MUI, SweetAlert2, react-qr-code
+ + 
+ - http://{SERVER_IP}/qorestoweb/menu?table={NOMOR_MEJA}
+ + Server Utama  : http://192.168.100.13/qorestoweb/menu?table={NOMOR_MEJA}
+ + Server Cadangan: http://192.168.100.85/qorestoweb-cad/menu?table={NOMOR_MEJA}
+ // Line 23:
+ - 6. Setelah login berhasil → render halaman menu
+ + 6. Jika server utama gagal → otomatis coba ke server cadangan
+ + 7. Setelah login berhasil → render halaman menu
+ // Line 41:
+ - - Tombol back hanya tampil di mode non-QR
+ + - Tombol back hanya tampil di mode non-QR (akses kasir biasa)
+ // Line 78:
+ - | `show_tunai_button: true` | Tampilkan opsi "Tunai" |
+ - | `show_tunai_button: false` | Skip langsung ke Xendit |
  // ... (truncated)
+ + ### 📖 Documentation
+ + 
+ + #### 1. ocs/ALUR-QORESTOWEB.md [20260820_104133]
+ + **Fungsi:** Implementasi: ALUR-QORESTOWEB  
+ + **Perubahan:** Pembaruan kode  
+ + 
+ + ---
+ + 
+ + ## 📊 **Summary**
+ + - **📖 Documentation:** 1 item
+ + - **Total Files Modified:** 1
+ + - **Main Focus:** 📖 Documentation
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Others
+ 
+ #### 1. ublic/qr-tables.html [20260820_131534]
+ **Fungsi:** Implementasi: qr-tables  
- - **📖 Documentation:** 1 item
- - **Total Files Modified:** 1
+ - **📖 Documentation:** 2 items
+ - **⚙️ Others:** 1 item
+ - **Total Files Modified:** 3
```

---

#### 2. docs/ALUR-QORESTOWEB.md [20260820_104133]
**Fungsi:** Implementasi: ALUR-QORESTOWEB  
**Perubahan:** Akses localStorage  
**Lines:** 1, 7-8, 15-16, 26-27, 44, 81-82, 88, 93, 96-103, 125-130, 132-134, 138-145, 150-152, 155-157, 160-161, 163-165, 170-173, 177, 181-182, 194, 197, 199, 205, 210-211, 213, 215, 219-220, 229-233, 239, 243-251, 254, 256, 260-272, 276-292, 294-345, 349, 358-361, 366, 370-392, 397, 399-419, 421, 423, 425-468

```javascript
// Line 1:
- # Alur Lengkap Qorestoweb — Self-Order Restoran via QR Code
+ # Dokumentasi Lengkap Qorestoweb — Self-Order Restoran via QR Code
+ **Tech Stack:** React (CRA), MUI, SweetAlert2, react-qr-code
+ 
- http://{SERVER_IP}/qorestoweb/menu?table={NOMOR_MEJA}
+ Server Utama  : http://192.168.100.13/qorestoweb/menu?table={NOMOR_MEJA}
+ Server Cadangan: http://192.168.100.85/qorestoweb-cad/menu?table={NOMOR_MEJA}
// Line 23:
- 6. Setelah login berhasil → render halaman menu
+ 6. Jika server utama gagal → otomatis coba ke server cadangan
+ 7. Setelah login berhasil → render halaman menu
// Line 41:
- - Tombol back hanya tampil di mode non-QR
+ - Tombol back hanya tampil di mode non-QR (akses kasir biasa)
// Line 78:
- | `show_tunai_button: true` | Tampilkan opsi "Tunai" |
- | `show_tunai_button: false` | Skip langsung ke Xendit |
+ | `show_tunai_button: true` | Tampilkan opsi "Tunai" + "Bayar Digital" |
+ | `show_tunai_button: false` | Skip langsung ke pilihan channel Xendit |
- 4. Bukti pesanan berisi: nomor order, daftar item, total, meja, nama, waktu
+ 4. Bukti pesanan berisi: nomor order, daftar item + catatan, total, meja, nama, waktu
- 2. Generate QR Code pembayaran
+ 2. Generate QR Code pembayaran via Xendit Payment Request API
- 5. Setelah lunas → tampilkan "Pesanan Berhasil!"
  // ... (truncated)
+ - Seluruh isi folder build
+ - `app.cfg` (bisa diedit post-deploy tanpa rebuild)
+ 
+ ---
+ 
+ ## 13. Catatan Teknis
+ 
+ ### Pajak
+ - Formula: `TAX_BASE × TAX_EFFECTIVE_RATE = 12 × (11/12) = 11%`
+ - Dikonfigurasi via env: `REACT_APP_TAX_BASE` dan `REACT_APP_TAX_EFFECTIVE_RATE`
+ 
+ ### Session
+ - Backend CSA support multi-session per secretkey
+ - Satu user (`xsv1`) bisa punya banyak `sessionid` aktif bersamaan
+ - Cocok untuk skenario banyak pelanggan scan QR bersamaan
+ 
+ ### Cart Storage
+ - `localStorage` key `QoCart` — format: `{ [itemId]: { item, qty, note, note2 } }`
+ - Persist antar page navigation, hilang saat scan QR baru atau clear browser
+ 
+ ### Debug Mode
+ - Set `debug_screen: true` di `app.cfg`
+ - Panel debug muncul di bagian atas layar (tidak menghalangi klik — `pointerEvents: none`)
+ - Tampilkan: table ID, session key, log fetch, error login
+ - **Matikan di production** (`debug_screen: false`)
```

---

#### 3. docs/changelog/daily/codeChange-20260820.md [20260820_104133]
**Fungsi:** Implementasi: codeChange-20260820  
**Perubahan:** Pembaruan kode  
**Lines:** 1-16

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 20 Agustus 2026
+ 
+ ### 📖 Documentation
+ 
+ #### 1. ocs/ALUR-QORESTOWEB.md [20260820_104133]
+ **Fungsi:** Implementasi: ALUR-QORESTOWEB  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **📖 Documentation:** 1 item
+ - **Total Files Modified:** 1
+ - **Main Focus:** 📖 Documentation
```

---

### ⚙️ Others

#### 1. public/qr-tables.html [20260820_131534]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  
**Lines:** 273

```javascript
// Line 270:
-       <input type="text" id="backupUrl" value="http://192.168.100.85/qorestoweb/menu" />
+       <input type="text" id="backupUrl" value="http://192.168.100.85/qorestoweb-cad/menu" />
```

---

## 📊 **Summary**
- **📖 Documentation:** 3 items
- **⚙️ Others:** 1 item
- **Total Files Modified:** 4
- **Main Focus:** 📖 Documentation
