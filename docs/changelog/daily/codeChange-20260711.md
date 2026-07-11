# Code Changes Summary

## 11 Juli 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260711_094254]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: formatter; Import: ToastBar; Import: bqo_api; Tambah state management; Tambah fungsi: handleCloseDialog; Tambah fungsi: handleOpenDialog; Tambah fungsi: handleChangeInfo; Akses localStorage; Tambah fungsi: removeItem; Tambah fungsi: increaseQtyItem; Tambah fungsi: decreaseQtyItem; Tambah fungsi: calculatePriceItem; Tambah fungsi: calculateTaxItem; Tambah fungsi: changeQtyItem; Tambah fungsi: selectedQtyItem; Tambah side effect; Tambah navigasi halaman; Tambah fungsi: isNoteExist; Tambah fungsi: handleChangeNoteValue; Tambah fungsi: handleOpenNoteForm; Tambah fungsi: handleCloseNoteForm; Tambah fungsi: handleSaveNoteForm; Tambah fungsi: showValidation; Tambah fungsi: handleOnCheckout; Hapus debug log; Ubah render/return JSX  
**Lines:** 22-24, 26, 28-80, 82-92, 94-101, 103-108, 110-115, 117-174, 176-184, 186-220, 222-232, 234-236, 238-240, 242-245, 247-251, 253-325, 327-527

```javascript
// Line 19:
- import { toCurrencyIDR } from '../../../utils/formatter'
+ import { toCurrencyIDR } from '../../../utils/formatter';
+ import ToastBar from '../../../components/ToastBar';
+ import bqo_api from '../controllers/bqo_api';
+ const TAX_PERCENT = 11;
-     const { smUp } = useResponsive();
-     const navigate = useNavigate();
-     const styles = {
-         container: {
-             background: '#eee',
-             paddingTop: smUp ? '25px' : '15px',
-             height: '100%',
-             paddingBottom: 100,
-         },
-         appBar: {
-             backgroundColor: '#fff',
-         },
-         appBarIcon: {
-             color: '#3f50b5',
-         },
-         imageList: {
-             height: smUp ? '85px' : '75px',
-             width: smUp ? '85px' : '75px',
-             objectFit: 'cover',
  // ... (truncated)
+               <Typography variant="h6" component="h2" textAlign="center">
+                 Catatan
+               </Typography>
+               <TextField
+                 sx={styles.noteForm}
+                 multiline
+                 value={noteValue}
+                 onChange={handleChangeNoteValue}
+                 rows={4}
+                 variant="filled"
+               />
+             </DialogContent>
+             <DialogActions>
+               <Button mr={2} variant="contained" onClick={handleSaveNoteForm} size="small">
+                 Konfirmasi
+               </Button>
+               <Button variant="contained" color="error" onClick={handleCloseNoteForm} size="small">
+                 Batal
+               </Button>
+             </DialogActions>
+           </>
+         )}
+       </Dialog>
+     </>
+   );
```

---

#### 2. src/scripts/modules/BQO/views/bqo_home.js [20260711_094254]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: formatter; Import: bqo_api; Tambah state management; Tambah fungsi: getDatas; Tambah side effect; Tambah fungsi: setDataToList; Ubah render/return JSX; Tambah fungsi: handleTabChange; Tambah fungsi: handleChangeSearch; Tambah fungsi: handleCloseDialog; Tambah fungsi: handleOpenDialog; Tambah fungsi: searchInfoDialog; Akses localStorage; Tambah fungsi: isExistItem; Tambah fungsi: addItem; Tambah fungsi: handleAddItemDlg; Tambah fungsi: removeItem; Tambah fungsi: increaseQtyItem; Tambah fungsi: decreaseQtyItem; Tambah fungsi: calculateQtyItem; Tambah fungsi: calculatePriceItem; Tambah fungsi: changeQtyItem; Tambah fungsi: selectedQtyItem; Tambah fungsi: isNoteExist; Tambah fungsi: handleChangeNoteValue; Tambah fungsi: handleOpenNoteForm; Tambah fungsi: handleCloseNoteForm; Tambah fungsi: handleSaveNoteForm; Tambah navigasi halaman  
**Lines:** 31-32, 34-89, 91-94, 96-98, 100-109, 111-122, 124-128, 130-138, 140-150, 152-163, 165-212, 214-240, 242-249, 251-285, 287-288, 290-368, 370-629

```javascript
// Line 28:
- import { toCurrencyIDR } from '../../../utils/formatter'
- export default function BQOHome() {
-     const { smUp } = useResponsive();
-     const navigate = useNavigate();
-     const styles = {
-         container: {
-             background: '#eee',
-             paddingTop: smUp ? '25px' : '15px',
-             height: '100%',
-             paddingBottom: 100,
-         },
-         appBar: {
-             backgroundColor: '#fff',
-         },
-         appBarIcon: {
-             color: '#3f50b5',
-         },
-         search: {
-             '& .MuiInputBase-input': {
-                 marginLeft: 2
-             },
-             fontSize: '0.95rem',
-             color: '#3f50b5',
-         },
  // ... (truncated)
+                 <Grid item>
+                   <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500}>
+                     {calculateQtyItem()} Item
+                   </Typography>
+                 </Grid>
+                 <Grid item>
+                   <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500}>
+                     :
+                   </Typography>
+                 </Grid>
+                 <Grid item>
+                   <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500}>
+                     Rp {toCurrencyIDR(calculatePriceItem())}
+                   </Typography>
+                 </Grid>
+               </Grid>
+               <Grid item container xs={1} justifyContent="flex-end">
+                 <ForwardIcon fontSize="small" />
+               </Grid>
+             </Grid>
+           </div>
+         </div>
+       )}
+     </>
+   );
```

---

### 📖 Documentation

#### 1. readme.md [20260711_094750]
**Fungsi:** Implementasi: readme  
**Perubahan:** Pembaruan kode  
**Lines:** 42-166, 176-181

```javascript
// Line 39:
+ ## Prasyarat
+ 
+ Pastikan sudah terinstall:
+ * [Node.js](https://nodejs.org/) v16 atau lebih baru
+ * [Yarn](https://yarnpkg.com/) (classic v1 atau v3+)
+ 
+ ---
+ 
+ ## Instalasi
+ 
+ ```bash
+ # Clone repository
+ git clone https://github.com/dhe2en832/qorestoweb.git
+ cd qorestoweb
+ 
+ # Install semua dependensi
+ yarn
+ ```
+ 
+ ---
+ 
+ ## Konfigurasi
+ 
+ Edit file `.env-cmdrc` di root project untuk menyesuaikan API endpoint per environment:
  // ... (truncated)
+ | Command | Keterangan |
+ | --- | --- |
+ | `yarn start` | Jalankan dev server tanpa env |
+ | `yarn start:dev` | Jalankan dev server dengan env `development` |
+ | `yarn start:qa` | Jalankan dev server dengan env `qa` |
+ | `yarn build:staging` | Build untuk staging |
+ | `yarn build:prod` | Build untuk production |
+ | `yarn ship` | Auto commit + push ke GitHub |
+ | `yarn test` | Jalankan test |
+ | `yarn new-package` | Reset node_modules dan install ulang |
+ 
+ ---
+ 
// Line 172:
- | Kunci    | Keterangan                          |
- | -------  | -------                             |
- | Alamat   | http://192.168.100.85/qorestoweb    |
- | User     | WSALES1                             |
- | Password | csa                                 |
+ | Kunci      | Keterangan                               |
+ | ---------- | ---------------------------------------- |
+ | Alamat     | http://192.168.100.85/qorestoweb         |
+ | Repository | https://github.com/dhe2en832/qorestoweb  |
+ | User       | WSALES1                                  |
+ | Password   | csa                                      |
```

---

#### 2. docs/Petunjuk Development QORESTOWEB - v1.0.0.docx [20260711_094254]
**Fungsi:** Implementasi: Petunjuk Development QORESTOWEB - v1.0.0  
**Perubahan:** Pembaruan kode  
**Lines:** 1-25

```javascript
// Line 1:
+ CSA Software
+ Petunjuk Development QORESTOWEB
+ 
+ QORESTOWEB merupakan aplikasi berbasis web untuk melakukan pemesanan makanan ditempat pada restoran atau kedai. Penjelasan tersebut dibagi menjadi 5 bagian, yaitu:
+  Persyaratan Development QORESTOWEB
+  Struktur Program QORESTOWEB
+  Dependency Program QORESTOWEB
+  Source Program QORESTOWEB
+  Deployment Program QORESTOWEB
+  Spesifikasi Data QORESTOWEB
+ 
+ A. Sub Judul 1	
+   Deskripsi mengenai apa saja yang akan dijelaskan usahakan tidak terlalu panjang dan langsung pada point penting. 
+   Jelaskan tahapan yang ingin disampaikan yaitu sebagai berikut :
+  Poin 1
+  Poin 2
+ 
+ 1. Sub Sub Judul	
+ 		Penjelasan detail mengenai poin yang sudah disebutkan sebelumnya diatas.
+  Sub Sub Poin 1
+  Sub Sub Poin 2 
+ 
+ 
+ B. Sub Judul 2	
+ 
```

---

#### 3. readme.md [20260711_094254]
**Fungsi:** Implementasi: readme  
**Perubahan:** Pembaruan kode  
**Lines:** 4-6, 27

```javascript
// Line 1:
+ ## Status
+ Discontinue (Project ini hanya digunakan untuk research, untuk project serupa yang masih aktif pindah ke .\PROJECTS\webcsa-v2\src\scripts\modules\BQO)
+ 
// Line 24:
-     * utils, folder kode utilitas yang digunanakan aplikasi.
+     * utils, folder kode utilitas yang digunakan aplikasi.
```

---

#### 4. readme.md [20260711_095041]
**Fungsi:** Implementasi: readme  
**Perubahan:** Pembaruan kode  
**Lines:** 134-146, 166-167

```javascript
// Line 50:
- # Clone repository
- git clone https://github.com/dhe2en832/qorestoweb.git
- cd qorestoweb
- 
// Line 131:
- 1. Cek apakah ada perubahan (`git status`)
- 2. Stage semua file (`git add -A`)
- 3. Buat commit message otomatis berisi tanggal dan daftar file yang berubah
- 4. Push ke branch `main` di remote `origin`
+ 1. Generate changelog harian otomatis (`docs/changelog/daily/codeChange-YYYYMMDD.md`)
+ 2. Cek apakah ada perubahan (`git status`)
+ 3. Stage semua file (`git add -A`)
+ 4. Buat commit message otomatis berisi tanggal dan ringkasan perubahan dari changelog
+ 5. Push ke branch `main` di remote `origin`
+ 
+ Untuk generate changelog saja tanpa push:
+ ```bash
+ yarn changelog
+ 
+ # Generate untuk tanggal tertentu
+ node generate-changelog.cjs --date=2026-07-11
+ ```
// Line 163:
- | `yarn ship` | Auto commit + push ke GitHub |
+ | `yarn changelog` | Generate changelog harian ke `docs/changelog/daily/` |
+ | `yarn ship` | Generate changelog + auto commit + push ke GitHub |
```

---

#### 5. generate-changelog.cjs [20260711_095041]
**Fungsi:** Implementasi: generate-changelog  
**Perubahan:** Pembaruan kode  

---

### 🔐 Auth/Session

#### 1. src/scripts/contexts/AuthContext.js [20260711_094254]
**Fungsi:** Context autentikasi global  
**Perubahan:** Pembaruan kode  
**Lines:** 70, 107, 124-125, 141, 165

```javascript
// Line 67:
-       setLoading && setLoading(false)
+       setLoading && setLoading(false);
// Line 104:
-   }
+   };
// Line 121:
-       if (resJson.result === true) AlertDialog('success', 'Logout', typesError.SESSION_CLOSED.res, handleLogout(cb));
+       if (resJson.result === true)
+         AlertDialog('success', 'Logout', typesError.SESSION_CLOSED.res, handleLogout(cb));
// Line 138:
-   }
+   };
// Line 161:
- }
+ }
```

---

### 🔌 API

#### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260711_094254]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Tambah error handling; Tambah HTTP request  
**Lines:** 5-19, 21-29, 33

```javascript
// Line 2:
-     static async getList(data) {
-         try {
-             const res = await fetch(ApiRoute.BQO_X, {
-                 method: 'POST',
-                 headers: {
-                     'content-type': 'application/json',
-                     secretkey: Config.SESSION_KEY(),
-                     sessionid: Config.SESSION_ID(),
-                 },
-                 body: JSON.stringify({ action: 'getlist', ...data }, null, 2),
-             });
-             const resJson = await res.json();
-             return resJson;
-         } catch (error) {
-             return error;
-         }
+   static async fetching(action, data) {
+     try {
+       const res = await fetch(ApiRoute.BQO_X, {
+         method: 'POST',
+         headers: {
+           'content-type': 'application/json',
+           secretkey: Config.SESSION_KEY(),
+           sessionid: Config.SESSION_ID(),
+         },
+         body: JSON.stringify({ action, ...data }, null, 2),
+       });
+       const resJson = await res.json();
+       return resJson;
+     } catch (error) {
+       return error;
+   }
+ 
+   static getList(data) {
+     return this.fetching('getList', data);
+   }
+ 
+   static add(data) {
+     return this.fetching('add', data);
+   }
- export default bqo_api;
+ export default bqo_api;
```

---

### ⚙️ Config

#### 1. git-push.cjs [20260711_094750]
**Fungsi:** Fungsi: run  
**Perubahan:** Tambah fungsi: run; Tambah fungsi: runSilent; Tambah error handling; Tambah fungsi: buildCommitMessage; Tambah fungsi: main  
**Lines:** 1-70

```javascript
// Line 1:
+ #!/usr/bin/env node
+ 
+ /* eslint-env node */
+ const { execSync } = require('child_process');
+ const fs = require('fs');
+ const path = require('path');
+ 
+ function run(cmd) {
+   return execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
+ }
+ 
+ function runSilent(cmd) {
+   try {
+     return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
+   } catch (e) {
+     return e.stdout || '';
+   }
+ }
+ 
+ function buildCommitMessage() {
+   const today = new Date();
+   const dateLabel = today.toLocaleDateString('id-ID', {
+     day: 'numeric',
+     month: 'long',
  // ... (truncated)
+ 
+   console.log('\n📦 Staging all changes...');
+   run('git add -A');
+ 
+   const message = buildCommitMessage();
+   console.log('\n📝 Commit message:\n');
+   console.log('─'.repeat(50));
+   console.log(message);
+   console.log('─'.repeat(50));
+ 
+   // Tulis message ke temp file agar aman dari karakter spesial
+   const tmpFile = path.join(process.cwd(), '.git', '_commit_msg_tmp');
+   fs.writeFileSync(tmpFile, message, 'utf8');
+ 
+   console.log('\n✍️  Committing...');
+   run(`git commit -F "${tmpFile}"`);
+   fs.unlinkSync(tmpFile);
+ 
+   console.log('\n🚀 Pushing...');
+   run('git push');
+ 
+   console.log('\n✅ Done!');
+ }
+ 
+ main();
```

---

#### 2. package.json [20260711_094750]
**Fungsi:** Implementasi: package  
**Perubahan:** Pembaruan kode  
**Lines:** 51-52

```javascript
// Line 48:
-     "new-package": "rm -rf node_modules yarn.lock && yarn --ignore-engines"
+     "new-package": "rm -rf node_modules yarn.lock && yarn --ignore-engines",
+     "ship": "node git-push.cjs"
```

---

#### 3. it-push.cjs [20260711_095041]
**Fungsi:** Implementasi: it-push  
**Perubahan:** Pembaruan kode  

---

#### 4. package.json [20260711_095041]
**Fungsi:** Implementasi: package  
**Perubahan:** Pembaruan kode  
**Lines:** 52

```javascript
// Line 49:
+     "changelog": "node generate-changelog.cjs",
```

---

## 📊 **Summary**
- **✨ Features:** 2 items
- **📖 Documentation:** 5 items
- **🔐 Auth/Session:** 1 item
- **🔌 API:** 1 item
- **⚙️ Config:** 4 items
- **Total Files Modified:** 13
- **Main Focus:** 📖 Documentation
