# Code Changes Summary

## 12 Agustus 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260812_142353]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: Download; Tambah fungsi: handleDownloadReceipt  
**Lines:** 28, 499-605, 1126-1135

```javascript
// Line 25:
+ import DownloadIcon from '@mui/icons-material/Download';
// Line 496:
+   // ── Download bukti order sebagai gambar ──────────────────────────────────
+   const handleDownloadReceipt = () => {
+     if (!kasirResult) return;
+     const { cartItems, subtotal, taxAmount, total, nomorBon, cqonum } = kasirResult;
+     const noPesanan = cqonum || nomorBon || '-';
+     const meja = info.seatNumber || '-';
+     const nama = info.orderByName || '-';
+     const waktu = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
+ 
+     // Hitung dimensi canvas
+     const padding = 24;
+     const lineH = 22;
+     const headerH = 100;
+     const itemH = cartItems.length * lineH;
+     const footerH = 120;
+     const canvasW = 380;
+     const canvasH = headerH + itemH + footerH + padding * 2;
+ 
+     const canvas = document.createElement('canvas');
+     canvas.width = canvasW * 2;   // retina
+     canvas.height = canvasH * 2;
+     const ctx = canvas.getContext('2d');
  // ... (truncated)
+ 
+     // Footer
+     ctx.textAlign = 'center';
+     ctx.fillStyle = '#aaa';
+     ctx.font = '10px sans-serif';
+     ctx.fillText('Tunjukkan bukti ini ke kasir saat pembayaran', canvasW / 2, y + 10);
+ 
+     // Download
+     const link = document.createElement('a');
+     link.download = `pesanan-${meja}-${noPesanan}.png`;
+     link.href = canvas.toDataURL('image/png');
+     link.click();
+   };
+ 
// Line 1123:
+           {/* Tombol download bukti pesanan */}
+           <Button
+             fullWidth
+             variant="contained"
+             color="primary"
+             startIcon={<DownloadIcon />}
+             onClick={handleDownloadReceipt}
+           >
+             Download Bukti Pesanan
+           </Button>
```

---

#### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260812_140437]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: app-config  
**Lines:** 37, 499-501, 1018-1029

```javascript
// Line 34:
+ import { getAppConfig } from '../../../utils/app-config';
// Line 496:
-     // Print guard — wajib cetak dulu sebelum bisa pesanan baru (pola trenly)
-     if (printCount === 0) {
+     const showPrint = getAppConfig().show_print_button !== false; // default true
+     // Print guard hanya berlaku jika tombol print ditampilkan (bukan QR/HP mode)
+     if (showPrint && printCount === 0) {
// Line 1015:
-           <Button
-             fullWidth
-             variant="contained"
-             startIcon={<PrintIcon />}
-             onClick={handlePrint}
-             color={printCount > 0 ? 'success' : 'primary'}
-           >
-             {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Tanda Pesanan'}
-           </Button>
+           {/* Tombol print — dikontrol via show_print_button di app.cfg */}
+           {getAppConfig().show_print_button !== false && (
+             <Button
+               fullWidth
+               variant="contained"
+               startIcon={<PrintIcon />}
+               onClick={handlePrint}
+               color={printCount > 0 ? 'success' : 'primary'}
+             >
+               {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Tanda Pesanan'}
+             </Button>
+           )}
```

---

#### 3. src/scripts/modules/BQO/views/bqo_home.js [20260812_140437]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: AuthContext; Tambah fungsi: loadMenu  
**Lines:** 38, 94, 267, 272-273, 275-284, 295-296

```javascript
// Line 35:
+ import { useAuth } from '../../../contexts/AuthContext';
// Line 91:
+   const auth = useAuth();
// Line 264:
-     addDebugLog(`mount — tableId:${getTableId()} loggedIn:${!!Config.SESSION_KEY()} key:${Config.SESSION_KEY()?.substring(0,8) ?? 'null'}...`);
+     addDebugLog(`mount — tableId:${getTableId()} key:${Config.SESSION_KEY()?.substring(0,8) ?? 'null'}...`);
-     async function setDataToList() {
+ 
+     async function loadMenu() {
-       const resJson = await getDatas();
+       let resJson = await getDatas();
+ 
+       // Jika gagal di QR mode → coba re-login dulu lalu retry sekali
+       if (!resJson && getTableId()) {
+         addDebugLog('getDatas gagal, coba re-login...', true);
+         await new Promise((resolve) => auth.signinAsGuest(resolve));
+         addDebugLog(`re-login selesai, key:${Config.SESSION_KEY()?.substring(0,8) ?? 'null'}...`);
+         resJson = await getDatas();
+       }
+ 
// Line 292:
-     isActive && setDataToList();
+ 
+     isActive && loadMenu();
```

---

#### 4. src/scripts/modules/BQO/views/bqo_home.js [20260812_133331]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: react-router-dom; Import: Container; Import: Dialog; Import: DialogContent; Import: DialogActions; Import: AppBar; Import: Grid; Import: Box; Import: Paper; Import: Toolbar; Import: Tabs; Import: Tab; Import: Button; Import: IconButton; Import: InputBase; Import: TextField; Import: Typography; Import: LinearProgress; Import: Skeleton; Import: TableRestaurant; Import: Search; Import: NoteAltOutlined; Import: Edit; Import: Add; Import: Remove; Import: ArrowBackIos; Import: ArrowForwardIos; Import: ShoppingCart; Import: ShoppingCartOutlined; Import: Close; Import: placeholder.png; Import: useResponsive; Import: formatter; Import: bqo_api; Import: Config; Import: app-config; Import: table-session  
**Lines:** 2-38

```javascript
// Line 1:
+ import { useNavigate } from 'react-router-dom';
+ import Container from '@mui/material/Container';
+ import Dialog from '@mui/material/Dialog';
+ import DialogContent from '@mui/material/DialogContent';
+ import DialogActions from '@mui/material/DialogActions';
+ import AppBar from '@mui/material/AppBar';
+ import Grid from '@mui/material/Grid';
+ import Box from '@mui/material/Box';
+ import Paper from '@mui/material/Paper';
+ import Toolbar from '@mui/material/Toolbar';
+ import Tabs from '@mui/material/Tabs';
+ import Tab from '@mui/material/Tab';
+ import Button from '@mui/material/Button';
+ import IconButton from '@mui/material/IconButton';
+ import InputBase from '@mui/material/InputBase';
+ import TextField from '@mui/material/TextField';
+ import Typography from '@mui/material/Typography';
+ import LinearProgress from '@mui/material/LinearProgress';
+ import Skeleton from '@mui/material/Skeleton';
+ import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
+ import SearchIcon from '@mui/icons-material/Search';
+ import NoteIcon from '@mui/icons-material/NoteAltOutlined';
+ import EditIcon from '@mui/icons-material/Edit';
+ import AddIcon from '@mui/icons-material/Add';
  // ... (truncated)
- import Button from '@mui/material/Button';
- import IconButton from '@mui/material/IconButton';
- import InputBase from '@mui/material/InputBase';
- import TextField from '@mui/material/TextField';
- import Typography from '@mui/material/Typography';
- import LinearProgress from '@mui/material/LinearProgress';
- import Skeleton from '@mui/material/Skeleton';
- import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
- import { getTableId, initTableId } from '../../../utils/table-session';
- import SearchIcon from '@mui/icons-material/Search';
- import NoteIcon from '@mui/icons-material/NoteAltOutlined';
- import EditIcon from '@mui/icons-material/Edit';
- import AddIcon from '@mui/icons-material/Add';
- import RemoveIcon from '@mui/icons-material/Remove';
- import BackIcon from '@mui/icons-material/ArrowBackIos';
- import ForwardIcon from '@mui/icons-material/ArrowForwardIos';
- import CartIcon from '@mui/icons-material/ShoppingCart';
- import CartLessIcon from '@mui/icons-material/ShoppingCartOutlined';
- import CloseIcon from '@mui/icons-material/Close';
- import Placeholder from '../../../../images/placeholder.png';
- import useResponsive from '../../../hooks/useResponsive';
- import { toCurrencyIDR } from '../../../utils/formatter';
- import bqo_api from '../controllers/bqo_api';
- import Config from '../../../Config';
- import { getAppConfig } from '../../../utils/app-config';
```

---

#### 5. src/scripts/modules/BQO/views/bqo_home.js [20260812_132835]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Ubah render/return JSX; Tambah fungsi: handleChangeSearch  
**Lines:** 1-51, 311-313, 315-341, 455-456, 458, 460, 462-463, 465-471, 473-476, 479-480, 707-708, 710-713

```javascript
// Line 1:
- import React, { useState, useEffect } from 'react';
+ import React, { useState, useEffect, useCallback, memo } from 'react';
+ 
+ // ── Komponen Dialog Catatan — dipisah agar tidak memicu re-render list saat ketik ──
+ const NoteDialog = memo(function NoteDialog({ open, initialValue, onSave, onClose }) {
+   const [value, setValue] = useState(initialValue || '');
+ 
+   // Sync nilai awal saat dialog dibuka
+   useEffect(() => {
+     if (open) setValue(initialValue || '');
+   }, [open, initialValue]);
+ 
+   return (
+     <Dialog
+       maxWidth="xs"
+       fullWidth
+       open={open}
+       onClose={onClose}
+       PaperProps={{
+         sx: {
+           position: { xs: 'fixed', sm: 'relative' },
+           top:      { xs: 16,     sm: 'auto'      },
+           m:        { xs: 1,      sm: 'auto'      },
+         }
  // ... (truncated)
-                 multiline
-                 fullWidth
-                 autoFocus
-                 value={noteValue}
-                 onChange={handleChangeNoteValue}
-                 rows={3}
-                 variant="filled"
-                 placeholder="Tulis catatan untuk item ini..."
-               />
-             </DialogContent>
-             <DialogActions>
-               <Button mr={2} variant="contained" onClick={handleSaveNoteForm} size="small">
-                 Konfirmasi
-               </Button>
-               <Button variant="contained" color="error" onClick={handleCloseNoteForm} size="small">
-                 Batal
-               </Button>
-             </DialogActions>
-           </>
-         )}
-       </Dialog>
+         initialValue={showDialog.isShow && showDialog.isForm ? (cart[showDialog.accessorID]?.note || '') : ''}
+         onSave={(value) => handleSaveNoteForm(value, showDialog.accessorID)}
+         onClose={handleCloseNoteForm}
+       />
```

---

#### 6. src/scripts/modules/BQO/views/bqo_home.js [20260812_130923]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 653-654, 658-665, 670, 676-677, 680, 682

```javascript
// Line 650:
-         maxWidth="md"
+         maxWidth="xs"
+         fullWidth
+         PaperProps={{
+           sx: {
+             // Di HP: posisikan dialog di bagian atas layar supaya tidak tertutup keyboard
+             position: { xs: 'fixed', sm: 'relative' },
+             top:      { xs: 16,     sm: 'auto'      },
+             m:        { xs: 1,      sm: 'auto'      },
+           }
+         }}
-               <Typography variant="h6" component="h2" textAlign="center">
+               <Typography variant="h6" component="h2" textAlign="center" mb={1}>
+                 fullWidth
+                 autoFocus
-                 rows={4}
+                 rows={3}
+                 placeholder="Tulis catatan untuk item ini..."
```

---

#### 7. src/scripts/modules/BQO/views/bqo_home.js [20260812_110833]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 216-217

```javascript
// Line 213:
+     const loginErr = window.sessionStorage.getItem('qoGuestLoginError');
+     if (loginErr) addDebugLog(`LOGIN ERR: ${loginErr}`, true);
```

---

#### 8. src/scripts/modules/BQO/controllers/bqo_mock.js [20260812_105050]
**Fungsi:** Modul: bqo_mock  
**Perubahan:** Pembaruan kode  
**Lines:** 19, 91

```javascript
// Line 16:
+ /* eslint-disable no-unused-vars */
// Line 88:
+ /* eslint-enable no-unused-vars */
```

---

#### 9. src/scripts/modules/BQO/views/bqo_checkout.js [20260812_105050]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: CircularProgress  
**Lines:** 17, 50, 426

```javascript
// Line 14:
- import CircularProgress from '@mui/material/CircularProgress';
+ import CircularProgress from '@mui/material/CircularProgress'; // eslint-disable-line no-unused-vars
// Line 47:
-   ? eval(TAX_RATE_STR) // "11/12" → 0.9166...
+   ? (() => { const [a, b] = TAX_RATE_STR.split('/'); return parseFloat(a) / parseFloat(b); })() // "11/12" → 0.9166...
// Line 423:
+           cremark2: d.note || '',
```

---

#### 10. src/scripts/modules/BQO/views/bqo_home.js [20260812_105050]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Pembaruan kode  
**Lines:** 233

```javascript
// Line 230:
-   }, []);
+   }, []); // eslint-disable-line react-hooks/exhaustive-deps
```

---

#### 11. src/scripts/modules/BQO/views/bqo_payment.js [20260812_105050]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Import: payment-api  
**Lines:** 29, 51, 100, 129, 173, 356

```javascript
// Line 26:
- import { fetchPaymentAPI, getPaymentAPIUrl, PRIMARY_BASE_URL, LOCAL_BASE_URL } from '../../../utils/payment-api';
+ import { fetchPaymentAPI, getPaymentAPIUrl, PRIMARY_BASE_URL, LOCAL_BASE_URL } from '../../../utils/payment-api'; // eslint-disable-line no-unused-vars
// Line 48:
-   ? eval(TAX_RATE_STR) // "11/12" → 0.9166...
+   ? (() => { const [a, b] = TAX_RATE_STR.split('/'); return parseFloat(a) / parseFloat(b); })() // "11/12" → 0.9166...
// Line 97:
-   const prevUserRef = useRef(null);
+   const prevUserRef = useRef(null); // eslint-disable-line no-unused-vars
// Line 126:
-   const { isDownloaded, downloadFailedTrx } = useFailedTrxDownload();
+   const { isDownloaded, downloadFailedTrx } = useFailedTrxDownload(); // eslint-disable-line no-unused-vars
// Line 170:
+         cremark2: d.note || '',
// Line 353:
+   // eslint-disable-next-line no-unused-vars
```

---

#### 12. src/scripts/modules/BQO/views/bqo_home.js [20260812_103649]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Import: app-config  
**Lines:** 38

```javascript
// Line 35:
+ import { getAppConfig } from '../../../utils/app-config';
```

---

#### 13. src/scripts/modules/BQO/views/bqo_home.js [20260812_101813]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Tambah state management; Tambah fungsi: addDebugLog  
**Lines:** 100-107, 118, 120-124, 214, 224-226, 425-442

```javascript
// Line 97:
+   const [debugLog, setDebugLog] = useState([]);
+ 
+   const debugEnabled = getAppConfig().debug_screen === true;
+ 
+   const addDebugLog = (msg, isError = false) => {
+     const time = new Date().toLocaleTimeString('id-ID');
+     setDebugLog((prev) => [...prev.slice(-19), { time, msg, isError }]);
+   };
// Line 115:
+     addDebugLog(`getList start — useBrwDef:${useBrwDef} key:${Config.SESSION_KEY()?.substring(0,8)}...`);
-     if (!res || !res.result || !res.data) return null;
+     if (!res || !res.result || !res.data) {
+       addDebugLog(`getList FAIL — result:${res?.result} msg:${res?.onfail?.cerror || JSON.stringify(res)?.substring(0,60)}`, true);
+       return null;
+     }
+     addDebugLog(`getList OK — ${res.data?.length ?? 0} items`);
// Line 210:
-     // (handle kasus: customer sudah login, lalu scan QR meja baru)
+     addDebugLog(`mount — tableId:${getTableId()} loggedIn:${!!Config.SESSION_KEY()} key:${Config.SESSION_KEY()?.substring(0,8) ?? 'null'}...`);
// Line 221:
+         addDebugLog(`lists loaded: ${resJson.datas.length} items`);
+       } else {
+         addDebugLog('lists empty or null', true);
// Line 422:
+       {/* Debug Panel — hanya tampil jika debug_screen: true di app.cfg */}
+       {debugEnabled && (
+         <div style={{
+           position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
+           background: 'rgba(0,0,0,0.85)', color: '#0f0', fontFamily: 'monospace',
+           fontSize: '11px', padding: '6px 8px', maxHeight: '200px', overflowY: 'auto',
+         }}>
+           <div style={{ color: '#ff0', fontWeight: 'bold', marginBottom: 4 }}>
+             🐛 DEBUG — tableId: {getTableId() || '(none)'} | key: {Config.SESSION_KEY()?.substring(0,10) ?? 'null'}...
+           </div>
+           {debugLog.length === 0 && <div style={{ color: '#aaa' }}>Menunggu log...</div>}
+           {debugLog.map((l, i) => (
+             <div key={i} style={{ color: l.isError ? '#f66' : '#0f0', lineHeight: 1.5 }}>
+               [{l.time}] {l.msg}
+             </div>
+           ))}
+         </div>
+       )}
```

---

#### 14. src/scripts/modules/BQO/views/bqo_home.js [20260812_093434]
**Fungsi:** Halaman utama / dashboard  
**Perubahan:** Tambah navigasi halaman  
**Lines:** 415-425

```javascript
// Line 412:
-               <Grid item xs={1}>
-                 <IconButton
-                   sx={styles.appBarIcon}
-                   onClick={() => {
-                     navigate('/');
-                   }}
-                 >
-                   <BackIcon />
-                 </IconButton>
-               </Grid>
+               {/* Tombol back hanya tampil di mode non-QR (akses via login biasa) */}
+               {!getTableId() && (
+                 <Grid item xs={1}>
+                   <IconButton
+                     sx={styles.appBarIcon}
+                     onClick={() => { navigate('/'); }}
+                   >
+                     <BackIcon />
+                   </IconButton>
+                 </Grid>
+               )}
```

---

#### 15. rc/scripts/modules/BQO/views/bqo_payment.js [20260812_151622]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Pembaruan kode  

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260812.md [20260812_142353]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage  
**Lines:** 7-82, 143, 204, 233, 246, 260, 278, 291, 317, 329, 382, 414, 416, 420-425, 428-433, 435-453, 455-458, 460-465, 467-478, 483, 544, 605, 666, 727, 788, 849, 910, 971, 1032, 1093, 1154, 1215, 1528-1556, 1573, 1634, 1648, 1664, 1678, 1701, 1713, 1774, 1789, 1809, 1823-1824, 1828

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_133331]
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260812_140437]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: app-config  
+ **Lines:** 37, 499-501, 1018-1029
+ 
+ ```javascript
+ // Line 34:
+ + import { getAppConfig } from '../../../utils/app-config';
+ // Line 496:
+ -     // Print guard — wajib cetak dulu sebelum bisa pesanan baru (pola trenly)
+ -     if (printCount === 0) {
+ +     const showPrint = getAppConfig().show_print_button !== false; // default true
+ +     // Print guard hanya berlaku jika tombol print ditampilkan (bukan QR/HP mode)
+ +     if (showPrint && printCount === 0) {
+ // Line 1015:
+ -           <Button
+ -             fullWidth
+ -             variant="contained"
+ -             startIcon={<PrintIcon />}
+ -             onClick={handlePrint}
+ -             color={printCount > 0 ? 'success' : 'primary'}
+ -           >
+ -             {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Tanda Pesanan'}
  // ... (truncated)
// Line 1819:
- #### 12. ublic/app.cfg [20260812_140433]
- **Fungsi:** Entry point aplikasi React  
- **Perubahan:** Pembaruan kode  
- 
- 
- #### 13. src/scripts/utils/app-config.js [20260812_140433]
- **Fungsi:** Entry point aplikasi React  
- **Perubahan:** Pembaruan kode  
- **Lines:** 28-29
- 
- ```javascript
- // Line 25:
- -   debug_screen:                  false, // true = tampilkan debug panel di layar
- +   debug_screen:                  false,
- +   show_print_button:             true,  // false = sembunyikan tombol print di struk kasir
- ```
- 
- 
- - **✨ Features:** 13 items
- - **📖 Documentation:** 13 items
+ - **✨ Features:** 14 items
+ - **📖 Documentation:** 14 items
- - **Total Files Modified:** 45
+ - **Total Files Modified:** 47
```

---

#### 2. docs/changelog/daily/codeChange-20260812.md [20260812_140437]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage; Tambah state management; Tambah side effect  
**Lines:** 7-68, 129, 158, 171, 185, 203, 216, 242, 254, 307, 339-379, 381-410, 416-477, 538, 599, 660, 721, 782, 843, 904, 965, 1026, 1087, 1148, 1727-1746, 1748-1749, 1752-1754

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_132835]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_133331]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Import: react-router-dom; Import: Container; Import: Dialog; Import: DialogContent; Import: DialogActions; Import: AppBar; Import: Grid; Import: Box; Import: Paper; Import: Toolbar; Import: Tabs; Import: Tab; Import: Button; Import: IconButton; Import: InputBase; Import: TextField; Import: Typography; Import: LinearProgress; Import: Skeleton; Import: TableRestaurant; Import: Search; Import: NoteAltOutlined; Import: Edit; Import: Add; Import: Remove; Import: ArrowBackIos; Import: ArrowForwardIos; Import: ShoppingCart; Import: ShoppingCartOutlined; Import: Close; Import: placeholder.png; Import: useResponsive; Import: formatter; Import: bqo_api; Import: Config; Import: app-config; Import: table-session  
+ **Lines:** 2-38
+ 
+ ```javascript
+ // Line 1:
+ + import { useNavigate } from 'react-router-dom';
+ + import Container from '@mui/material/Container';
+ + import Dialog from '@mui/material/Dialog';
+ + import DialogContent from '@mui/material/DialogContent';
+ + import DialogActions from '@mui/material/DialogActions';
+ + import AppBar from '@mui/material/AppBar';
+ + import Grid from '@mui/material/Grid';
+ + import Box from '@mui/material/Box';
+ + import Paper from '@mui/material/Paper';
+ + import Toolbar from '@mui/material/Toolbar';
+ + import Tabs from '@mui/material/Tabs';
+ + import Tab from '@mui/material/Tab';
+ + import Button from '@mui/material/Button';
+ + import IconButton from '@mui/material/IconButton';
+ + import InputBase from '@mui/material/InputBase';
+ + import TextField from '@mui/material/TextField';
  // ... (truncated)
+ 
+ #### 13. src/scripts/utils/app-config.js [20260812_140433]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 28-29
+ 
+ ```javascript
+ // Line 25:
+ -   debug_screen:                  false, // true = tampilkan debug panel di layar
+ +   debug_screen:                  false,
+ +   show_print_button:             true,  // false = sembunyikan tombol print di struk kasir
+ ```
+ 
+ ---
+ 
- - **✨ Features:** 11 items
- - **📖 Documentation:** 12 items
+ - **✨ Features:** 13 items
+ - **📖 Documentation:** 13 items
- - **⚙️ Others:** 11 items
- - **Total Files Modified:** 40
- - **Main Focus:** 📖 Documentation
+ - **⚙️ Others:** 13 items
+ - **Total Files Modified:** 45
+ - **Main Focus:** Features
```

---

#### 3. docs/changelog/daily/codeChange-20260812.md [20260812_133331]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage; Tambah state management; Tambah side effect; Ubah render/return JSX  
**Lines:** 278-283, 286-347, 408, 469, 530, 591, 652, 713, 774, 835, 896, 957, 1537-1538, 1542

```javascript
// Line 275:
+ #### 11. rc/scripts/modules/BQO/views/bqo_home.js [20260812_133329]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_132835]
+ #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_132926]
+ **Fungsi:** Implementasi: codeChange-20260812  
+ **Perubahan:** Tambah state management; Tambah side effect; Ubah render/return JSX; Akses localStorage  
+ **Lines:** 7-68, 97, 110, 124, 142, 155, 181, 193, 246, 278, 280-283, 285-339, 341, 402, 463, 524, 585, 646, 707, 768, 829, 890, 1471, 1475-1476
+ 
+ ```javascript
+ // Line 4:
+ - #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_130923]
+ + #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_132835]
+ + **Fungsi:** Halaman utama / dashboard  
+ + **Perubahan:** Import: react; Tambah state management; Tambah side effect; Ubah render/return JSX; Tambah fungsi: handleChangeSearch  
+ + **Lines:** 1-51, 311-313, 315-341, 455-456, 458, 460, 462-463, 465-471, 473-476, 479-480, 707-708, 710-713
+ + 
+ + ```javascript
+ + // Line 1:
+ + - import React, { useState, useEffect } from 'react';
+ + + import React, { useState, useEffect, useCallback, memo } from 'react';
  // ... (truncated)
// Line 649:
- #### 6. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
+ #### 7. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
// Line 710:
- #### 7. docs/changelog/daily/codeChange-20260812.md [20260812_103649]
+ #### 8. docs/changelog/daily/codeChange-20260812.md [20260812_103649]
// Line 771:
- #### 8. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
+ #### 9. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
// Line 832:
- #### 9. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
+ #### 10. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
// Line 893:
- #### 10. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
+ #### 11. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
// Line 954:
- #### 11. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
+ #### 12. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
// Line 1534:
- - **✨ Features:** 10 items
- - **📖 Documentation:** 11 items
+ - **✨ Features:** 11 items
+ - **📖 Documentation:** 12 items
- - **Total Files Modified:** 38
+ - **Total Files Modified:** 40
```

---

#### 4. docs/changelog/daily/codeChange-20260812.md [20260812_132926]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Tambah state management; Tambah side effect; Ubah render/return JSX; Akses localStorage  
**Lines:** 7-68, 97, 110, 124, 142, 155, 181, 193, 246, 278, 280-283, 285-339, 341, 402, 463, 524, 585, 646, 707, 768, 829, 890, 1471, 1475-1476

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_130923]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_132835]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Import: react; Tambah state management; Tambah side effect; Ubah render/return JSX; Tambah fungsi: handleChangeSearch  
+ **Lines:** 1-51, 311-313, 315-341, 455-456, 458, 460, 462-463, 465-471, 473-476, 479-480, 707-708, 710-713
+ 
+ ```javascript
+ // Line 1:
+ - import React, { useState, useEffect } from 'react';
+ + import React, { useState, useEffect, useCallback, memo } from 'react';
+ + 
+ + // ── Komponen Dialog Catatan — dipisah agar tidak memicu re-render list saat ketik ──
+ + const NoteDialog = memo(function NoteDialog({ open, initialValue, onSave, onClose }) {
+ +   const [value, setValue] = useState(initialValue || '');
+ + 
+ +   // Sync nilai awal saat dialog dibuka
+ +   useEffect(() => {
+ +     if (open) setValue(initialValue || '');
+ +   }, [open, initialValue]);
+ + 
+ +   return (
+ +     <Dialog
+ +       maxWidth="xs"
+ +       fullWidth
  // ... (truncated)
// Line 582:
- #### 5. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
+ #### 6. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
// Line 643:
- #### 6. docs/changelog/daily/codeChange-20260812.md [20260812_103649]
+ #### 7. docs/changelog/daily/codeChange-20260812.md [20260812_103649]
// Line 704:
- #### 7. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
+ #### 8. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
// Line 765:
- #### 8. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
+ #### 9. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
// Line 826:
- #### 9. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
+ #### 10. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
// Line 887:
- #### 10. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
+ #### 11. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
// Line 1468:
- - **📖 Documentation:** 10 items
+ - **📖 Documentation:** 11 items
- - **Total Files Modified:** 37
- - **Main Focus:** ⚙️ Others
+ - **Total Files Modified:** 38
+ - **Main Focus:** 📖 Documentation
```

---

#### 5. docs/changelog/daily/codeChange-20260812.md [20260812_132835]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage  
**Lines:** 7-36, 49, 63, 81, 94, 120, 132, 185, 217, 225-286, 347, 408, 469, 530, 591, 652, 713, 774, 1354-1355, 1359

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_110833]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_130923]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 653-654, 658-665, 670, 676-677, 680, 682
+ 
+ ```javascript
+ // Line 650:
+ -         maxWidth="md"
+ +         maxWidth="xs"
+ +         fullWidth
+ +         PaperProps={{
+ +           sx: {
+ +             // Di HP: posisikan dialog di bagian atas layar supaya tidak tertutup keyboard
+ +             position: { xs: 'fixed', sm: 'relative' },
+ +             top:      { xs: 16,     sm: 'auto'      },
+ +             m:        { xs: 1,      sm: 'auto'      },
+ +           }
+ +         }}
+ -               <Typography variant="h6" component="h2" textAlign="center">
+ +               <Typography variant="h6" component="h2" textAlign="center" mb={1}>
+ +                 fullWidth
+ +                 autoFocus
+ -                 rows={4}
  // ... (truncated)
// Line 466:
- #### 4. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
+ #### 5. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
// Line 527:
- #### 5. docs/changelog/daily/codeChange-20260812.md [20260812_103649]
+ #### 6. docs/changelog/daily/codeChange-20260812.md [20260812_103649]
// Line 588:
- #### 6. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
+ #### 7. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
// Line 649:
- #### 7. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
+ #### 8. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
// Line 710:
- #### 8. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
+ #### 9. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
// Line 771:
- #### 9. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
+ #### 10. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
// Line 1351:
- - **✨ Features:** 9 items
- - **📖 Documentation:** 9 items
+ - **✨ Features:** 10 items
+ - **📖 Documentation:** 10 items
- - **Total Files Modified:** 35
+ - **Total Files Modified:** 37
```

---

#### 6. docs/changelog/daily/codeChange-20260812.md [20260812_130923]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage  
**Lines:** 188-193, 196-257, 318, 379, 440, 501, 562, 623, 684, 997-1014, 1075, 1089, 1105, 1119, 1142, 1154, 1215, 1230, 1250, 1264-1265, 1269

```javascript
// Line 185:
+ #### 9. rc/scripts/modules/BQO/views/bqo_home.js [20260812_130919]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_110833]
+ #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_114806]
+ **Fungsi:** Implementasi: codeChange-20260812  
+ **Perubahan:** Akses localStorage  
+ **Lines:** 7-20, 34, 52, 65, 91, 103, 156, 188-193, 196-246, 251, 312, 373, 434, 495, 556, 617, 680-697, 758, 773, 1179-1184, 1187, 1190-1191
+ 
+ ```javascript
+ // Line 4:
+ - #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260812_105050]
+ + #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_110833]
+ + **Fungsi:** Halaman utama / dashboard  
+ + **Perubahan:** Pembaruan kode  
+ + **Lines:** 216-217
+ + 
+ + ```javascript
+ + // Line 213:
+ + +     const loginErr = window.sessionStorage.getItem('qoGuestLoginError');
+ + +     if (loginErr) addDebugLog(`LOGIN ERR: ${loginErr}`, true);
  // ... (truncated)
+ #### 7. src/scripts/utils/app-config.js [20260812_093434]
// Line 1151:
- #### 7. public/qr-tables.html [20260812_091046]
+ #### 8. public/qr-tables.html [20260812_091046]
// Line 1212:
- #### 8. public/app.cfg [20260812_090252]
+ #### 9. public/app.cfg [20260812_090252]
// Line 1227:
- #### 9. src/scripts/App.js [20260812_090252]
+ #### 10. src/scripts/App.js [20260812_090252]
// Line 1247:
- #### 10. src/scripts/utils/app-config.js [20260812_090252]
+ #### 11. src/scripts/utils/app-config.js [20260812_090252]
// Line 1260:
- #### 11. ublic/app.cfg [20260812_114803]
- **Fungsi:** Entry point aplikasi React  
- **Perubahan:** Pembaruan kode  
- 
- 
- - **✨ Features:** 8 items
- - **📖 Documentation:** 8 items
+ - **✨ Features:** 9 items
+ - **📖 Documentation:** 9 items
- - **Total Files Modified:** 33
+ - **Total Files Modified:** 35
```

---

#### 7. docs/changelog/daily/codeChange-20260812.md [20260812_114806]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage  
**Lines:** 7-20, 34, 52, 65, 91, 103, 156, 188-193, 196-246, 251, 312, 373, 434, 495, 556, 617, 680-697, 758, 773, 1179-1184, 1187, 1190-1191

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260812_105050]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_110833]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 216-217
+ 
+ ```javascript
+ // Line 213:
+ +     const loginErr = window.sessionStorage.getItem('qoGuestLoginError');
+ +     if (loginErr) addDebugLog(`LOGIN ERR: ${loginErr}`, true);
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/controllers/bqo_mock.js [20260812_105050]
// Line 31:
- #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260812_105050]
+ #### 3. src/scripts/modules/BQO/views/bqo_checkout.js [20260812_105050]
// Line 49:
- #### 3. src/scripts/modules/BQO/views/bqo_home.js [20260812_105050]
+ #### 4. src/scripts/modules/BQO/views/bqo_home.js [20260812_105050]
// Line 62:
- #### 4. src/scripts/modules/BQO/views/bqo_payment.js [20260812_105050]
+ #### 5. src/scripts/modules/BQO/views/bqo_payment.js [20260812_105050]
  // ... (truncated)
// Line 755:
- #### 2. src/scripts/utils/table-session.js [20260812_093434]
+ #### 3. src/scripts/utils/table-session.js [20260812_093434]
// Line 770:
- #### 3. src/scripts/contexts/AuthContext.js [20260812_090252]
+ #### 4. src/scripts/contexts/AuthContext.js [20260812_090252]
// Line 831:
- #### 4. rc/scripts/contexts/AuthContext.js [20260812_110829]
- **Fungsi:** Context autentikasi global  
- **Perubahan:** Pembaruan kode  
- 
- 
// Line 1176:
+ #### 11. ublic/app.cfg [20260812_114803]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- - **📖 Documentation:** 7 items
+ - **📖 Documentation:** 8 items
- - **⚙️ Others:** 10 items
- - **Total Files Modified:** 31
+ - **⚙️ Others:** 11 items
+ - **Total Files Modified:** 33
```

---

#### 8. docs/changelog/daily/codeChange-20260812.md [20260812_110833]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage; Tambah side effect; Tambah state management  
**Lines:** 175-187, 190-251, 312, 373, 434, 495, 556, 756-761, 764-810, 1108-1110, 1113

```javascript
// Line 172:
+ #### 8. src/scripts/modules/BQO/views/bqo_home.js [20260812_110829]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 216-217
+ 
+ ```javascript
+ // Line 213:
+ +     const loginErr = window.sessionStorage.getItem('qoGuestLoginError');
+ +     if (loginErr) addDebugLog(`LOGIN ERR: ${loginErr}`, true);
+ ```
+ 
+ ---
+ 
- #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
+ #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_105611]
+ **Fungsi:** Implementasi: codeChange-20260812  
+ **Perubahan:** Akses localStorage  
+ **Lines:** 7-78, 90, 143, 175, 177-180, 183-233, 238, 299, 360, 421, 482, 730-735, 989, 991, 993
+ 
+ ```javascript
+ // Line 4:
+ - #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_103649]
+ + #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260812_105050]
+ + **Fungsi:** Modul: bqo_mock  
  // ... (truncated)
+ +   if (isSigningIn) return <ProgressLoader />;
+ -   // Mode QR: sedang proses auto-login → render null (tunggu sebentar)
+ -   if (isQRMode && !auth.loggedIn) return null;
+ +   // Mode QR: belum login dan belum dicoba → loader sementara
+ +   if (isQRMode && !auth.loggedIn && !signInDone) return <ProgressLoader />;
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/routes/PrivateRoute.js [20260812_090252]
// Line 853:
- #### 2. rc/scripts/routes/PrivateRoute.js [20260812_105608]
- **Fungsi:** Route: PrivateRoute  
- **Perubahan:** Pembaruan kode  
- 
- 
// Line 1105:
- - **✨ Features:** 7 items
- - **📖 Documentation:** 6 items
- - **🔐 Auth/Session:** 3 items
+ - **✨ Features:** 8 items
+ - **📖 Documentation:** 7 items
+ - **🔐 Auth/Session:** 4 items
- - **Total Files Modified:** 28
+ - **Total Files Modified:** 31
```

---

#### 9. docs/changelog/daily/codeChange-20260812.md [20260812_105611]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage  
**Lines:** 7-78, 90, 143, 175, 177-180, 183-233, 238, 299, 360, 421, 482, 730-735, 989, 991, 993

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_103649]
+ #### 1. src/scripts/modules/BQO/controllers/bqo_mock.js [20260812_105050]
+ **Fungsi:** Modul: bqo_mock  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 19, 91
+ 
+ ```javascript
+ // Line 16:
+ + /* eslint-disable no-unused-vars */
+ // Line 88:
+ + /* eslint-enable no-unused-vars */
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260812_105050]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: CircularProgress  
+ **Lines:** 17, 50, 426
+ 
+ ```javascript
+ // Line 14:
+ - import CircularProgress from '@mui/material/CircularProgress';
+ + import CircularProgress from '@mui/material/CircularProgress'; // eslint-disable-line no-unused-vars
  // ... (truncated)
- #### 2. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
+ #### 3. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
// Line 357:
- #### 3. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
+ #### 4. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
// Line 418:
- #### 4. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
+ #### 5. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
// Line 479:
- #### 5. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
+ #### 6. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
// Line 727:
+ #### 2. rc/scripts/routes/PrivateRoute.js [20260812_105608]
+ **Fungsi:** Route: PrivateRoute  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
// Line 986:
- - **📖 Documentation:** 5 items
+ - **📖 Documentation:** 6 items
- - **🔌 API:** 1 item
+ - **🔌 API:** 2 items
- - **Total Files Modified:** 26
+ - **Total Files Modified:** 28
```

---

#### 10. docs/changelog/daily/codeChange-20260812.md [20260812_105050]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage; Tambah navigasi halaman  
**Lines:** 7-19, 72, 104-128, 130-131, 134-162, 169-230, 291, 352, 413, 663-724, 738, 754, 768, 791, 803, 864, 879, 899, 913-914, 918

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_101813]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_103649]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Import: app-config  
+ **Lines:** 38
+ 
+ ```javascript
+ // Line 35:
+ + import { getAppConfig } from '../../../utils/app-config';
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_home.js [20260812_101813]
// Line 69:
- #### 2. src/scripts/modules/BQO/views/bqo_home.js [20260812_093434]
+ #### 3. src/scripts/modules/BQO/views/bqo_home.js [20260812_093434]
// Line 101:
- #### 3. src/scripts/modules/BQO/views/bqo_home.js [20260812_103647]
+ #### 4. rc/scripts/modules/BQO/controllers/bqo_mock.js [20260812_105047]
+ **Fungsi:** Modul: bqo_mock  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
  // ... (truncated)
+ #### 6. src/scripts/utils/app-config.js [20260812_093434]
// Line 800:
- #### 6. public/qr-tables.html [20260812_091046]
+ #### 7. public/qr-tables.html [20260812_091046]
// Line 861:
- #### 7. public/app.cfg [20260812_090252]
+ #### 8. public/app.cfg [20260812_090252]
// Line 876:
- #### 8. src/scripts/App.js [20260812_090252]
+ #### 9. src/scripts/App.js [20260812_090252]
// Line 896:
- #### 9. src/scripts/utils/app-config.js [20260812_090252]
+ #### 10. src/scripts/utils/app-config.js [20260812_090252]
// Line 909:
- #### 10. ublic/qr-tables.html [20260812_103647]
- **Fungsi:** Implementasi: qr-tables  
- **Perubahan:** Pembaruan kode  
- 
- 
- - **✨ Features:** 3 items
- - **📖 Documentation:** 4 items
+ - **✨ Features:** 7 items
+ - **📖 Documentation:** 5 items
- - **Total Files Modified:** 21
+ - **Total Files Modified:** 26
```

---

#### 11. docs/changelog/daily/codeChange-20260812.md [20260812_103649]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Tambah navigasi halaman; Akses localStorage; Tambah state management  
**Lines:** 7, 60-103, 106-167, 228, 289, 539-569, 583, 606, 618, 679, 694, 714, 727-728, 734-735, 738-739

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_093434]
- **Fungsi:** Halaman utama / dashboard  
- **Perubahan:** Tambah navigasi halaman  
- **Lines:** 415-425
- 
- ```javascript
- // Line 412:
- -               <Grid item xs={1}>
- -                 <IconButton
- -                   sx={styles.appBarIcon}
- -                   onClick={() => {
- -                     navigate('/');
- -                   }}
- -                 >
- -                   <BackIcon />
- -                 </IconButton>
- -               </Grid>
- +               {/* Tombol back hanya tampil di mode non-QR (akses via login biasa) */}
- +               {!getTableId() && (
- +                 <Grid item xs={1}>
- +                   <IconButton
- +                     sx={styles.appBarIcon}
- +                     onClick={() => { navigate('/'); }}
- +                   >
  // ... (truncated)
+ #### 10. ublic/qr-tables.html [20260812_103647]
+ **Fungsi:** Implementasi: qr-tables  
- #### 9. src/scripts/utils/app-config.js [20260812_101811]
- **Fungsi:** Entry point aplikasi React  
- **Perubahan:** Pembaruan kode  
- **Lines:** 25, 27-28
- 
- ```javascript
- // Line 22:
- -   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
- +   qr_session_key:                '',
- -   qr_guest_pass:                 '',    // password untuk login guest via QR
- +   qr_guest_pass:                 '',
- +   debug_screen:                  false, // true = tampilkan debug panel di layar
- ```
- 
- 
- - **✨ Features:** 2 items
- - **📖 Documentation:** 3 items
+ - **✨ Features:** 3 items
+ - **📖 Documentation:** 4 items
- - **⚙️ Others:** 9 items
- - **Total Files Modified:** 18
+ - **⚙️ Others:** 10 items
+ - **Total Files Modified:** 21
```

---

#### 12. docs/changelog/daily/codeChange-20260812.md [20260812_101813]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Tambah state management; Akses localStorage; Tambah navigasi halaman  
**Lines:** 7, 39-91, 94-155, 216, 279, 340, 355-415, 466-515, 576, 591, 611, 624, 630, 633, 636-641, 647-648, 651-652

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_093433]
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_093434]
// Line 36:
+ #### 2. src/scripts/modules/BQO/views/bqo_home.js [20260812_101811]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Tambah state management; Tambah fungsi: addDebugLog  
+ **Lines:** 100-107, 118, 120-124, 214, 224-226, 425-442
+ 
+ ```javascript
+ // Line 97:
+ +   const [debugLog, setDebugLog] = useState([]);
+ + 
+ +   const debugEnabled = getAppConfig().debug_screen === true;
+ + 
+ +   const addDebugLog = (msg, isError = false) => {
+ +     const time = new Date().toLocaleTimeString('id-ID');
+ +     setDebugLog((prev) => [...prev.slice(-19), { time, msg, isError }]);
+ +   };
+ // Line 115:
+ +     addDebugLog(`getList start — useBrwDef:${useBrwDef} key:${Config.SESSION_KEY()?.substring(0,8)}...`);
+ -     if (!res || !res.result || !res.data) return null;
+ +     if (!res || !res.result || !res.data) {
+ +       addDebugLog(`getList FAIL — result:${res?.result} msg:${res?.onfail?.cerror || JSON.stringify(res)?.substring(0,60)}`, true);
+ +       return null;
  // ... (truncated)
- +       window.localStorage.removeItem('userID');
- +     }
- ```
- 
- 
- #### 7. src/scripts/utils/app-config.js [20260812_093433]
+ #### 9. src/scripts/utils/app-config.js [20260812_101811]
- **Lines:** 27
+ **Lines:** 25, 27-28
- // Line 24:
- +   qr_guest_pass:                 '',    // password untuk login guest via QR
+ // Line 22:
+ -   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
+ +   qr_session_key:                '',
+ -   qr_guest_pass:                 '',    // password untuk login guest via QR
+ +   qr_guest_pass:                 '',
+ +   debug_screen:                  false, // true = tampilkan debug panel di layar
- - **✨ Features:** 1 item
- - **📖 Documentation:** 2 items
+ - **✨ Features:** 2 items
+ - **📖 Documentation:** 3 items
- - **⚙️ Others:** 7 items
- - **Total Files Modified:** 14
+ - **⚙️ Others:** 9 items
+ - **Total Files Modified:** 18
```

---

#### 13. docs/changelog/daily/codeChange-20260812.md [20260812_093434]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Tambah navigasi halaman; Akses localStorage  
**Lines:** 5-38, 41-102, 226-301, 352-413, 428, 448, 461-462, 467-501, 503-505, 507-508

```javascript
// Line 2:
+ ### ✨ Features
+ 
+ #### 1. src/scripts/modules/BQO/views/bqo_home.js [20260812_093433]
+ **Fungsi:** Halaman utama / dashboard  
+ **Perubahan:** Tambah navigasi halaman  
+ **Lines:** 415-425
+ 
+ ```javascript
+ // Line 412:
+ -               <Grid item xs={1}>
+ -                 <IconButton
+ -                   sx={styles.appBarIcon}
+ -                   onClick={() => {
+ -                     navigate('/');
+ -                   }}
+ -                 >
+ -                   <BackIcon />
+ -                 </IconButton>
+ -               </Grid>
+ +               {/* Tombol back hanya tampil di mode non-QR (akses via login biasa) */}
+ +               {!getTableId() && (
+ +                 <Grid item xs={1}>
+ +                   <IconButton
+ +                     sx={styles.appBarIcon}
  // ... (truncated)
+ ```
+ 
+ ---
+ 
+ #### 7. src/scripts/utils/app-config.js [20260812_093433]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 27
+ 
+ ```javascript
+ // Line 24:
+ +   qr_guest_pass:                 '',    // password untuk login guest via QR
+ ```
+ 
+ ---
+ 
- - **📖 Documentation:** 1 item
- - **🔐 Auth/Session:** 1 item
+ - **✨ Features:** 1 item
+ - **📖 Documentation:** 2 items
+ - **🔐 Auth/Session:** 3 items
- - **⚙️ Others:** 4 items
- - **Total Files Modified:** 7
+ - **⚙️ Others:** 7 items
+ - **Total Files Modified:** 14
```

---

#### 14. docs/changelog/daily/codeChange-20260812.md [20260812_091046]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage  
**Lines:** 5-67, 70, 133, 181, 184-192, 196, 216, 229-234, 236, 239-240

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
+ **Fungsi:** Implementasi: codeChange-20260812  
+ **Perubahan:** Akses localStorage; Tambah side effect; Tambah navigasi halaman  
+ **Lines:** 1-162
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 12 Agustus 2026
+ + 
+ + ### 🔐 Auth/Session
+ + 
+ + #### 1. src/scripts/contexts/AuthContext.js [20260812_090251]
+ + **Fungsi:** Context autentikasi global  
+ + **Perubahan:** Import: app-config; Tambah fungsi: signinAsGuest; Akses localStorage  
+ + **Lines:** 10, 24-25, 27-28, 30-49, 60, 62-63, 77-78, 99-102, 131-133, 135, 165, 176
+ + 
+ + ```javascript
+ + // Line 7:
+ + + import { getAppConfig } from '../utils/app-config';
+ + // Line 21:
  // ... (truncated)
+ 
+ ```javascript
+ // Line 6:
+ -   "use_mock_bqo": false
+ +   "use_mock_bqo": false,
+ +   "qr_session_key": "78dfcc919bfa35f1852da50f7c6d4d14",
+ +   "qr_guest_user": "GUEST"
+ ```
- #### 2. src/scripts/App.js [20260812_090251]
+ #### 2. src/scripts/App.js [20260812_090252]
// Line 213:
- #### 3. src/scripts/utils/app-config.js [20260812_090251]
+ #### 3. src/scripts/utils/app-config.js [20260812_090252]
// Line 226:
+ #### 4. public/qr-tables.html [20260812_091045]
+ **Fungsi:** Implementasi: qr-tables  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ - **📖 Documentation:** 1 item
- - **⚙️ Others:** 3 items
- - **Total Files Modified:** 5
+ - **⚙️ Others:** 4 items
+ - **Total Files Modified:** 7
```

---

#### 15. docs/changelog/daily/codeChange-20260812.md [20260812_090252]
**Fungsi:** Implementasi: codeChange-20260812  
**Perubahan:** Akses localStorage; Tambah side effect; Tambah navigasi halaman  
**Lines:** 1-162

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 12 Agustus 2026
+ 
+ ### 🔐 Auth/Session
+ 
+ #### 1. src/scripts/contexts/AuthContext.js [20260812_090251]
+ **Fungsi:** Context autentikasi global  
+ **Perubahan:** Import: app-config; Tambah fungsi: signinAsGuest; Akses localStorage  
+ **Lines:** 10, 24-25, 27-28, 30-49, 60, 62-63, 77-78, 99-102, 131-133, 135, 165, 176
+ 
+ ```javascript
+ // Line 7:
+ + import { getAppConfig } from '../utils/app-config';
+ // Line 21:
+ -   const [loggedIn, setLoggedIn] = useLocalStorage('loggedIn', false);
+ -   const [userID, setUserID] = useLocalStorage('userID', null);
+ +   const [loggedIn, setLoggedIn]           = useLocalStorage('loggedIn', false);
+ +   const [userID, setUserID]               = useLocalStorage('userID', null);
+ -   const [sessionKey, setSessionKey] = useLocalStorage('sessionKey', null);
+ -   const [sessionID, setSessionID] = useLocalStorage('sessionID', null);
+ +   const [sessionKey, setSessionKey]       = useLocalStorage('sessionKey', null);
+ +   const [sessionID, setSessionID]         = useLocalStorage('sessionID', null);
+ -   // const signin = async (data, cb, isForm) => {
  // ... (truncated)
+ +                   : <PrivateRoute><Home /></PrivateRoute>  // akses biasa → home (butuh login)
+ +               } />
+ ```
+ 
+ ---
+ 
+ #### 3. src/scripts/utils/app-config.js [20260812_090251]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 25-26
+ 
+ ```javascript
+ // Line 22:
+ +   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
+ +   qr_guest_user:                 'GUEST',
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **🔐 Auth/Session:** 1 item
+ - **🔌 API:** 1 item
+ - **⚙️ Others:** 3 items
+ - **Total Files Modified:** 5
+ - **Main Focus:** ⚙️ Others
```

---

### 🔐 Auth/Session

#### 1. src/scripts/contexts/AuthContext.js [20260812_110833]
**Fungsi:** Context autentikasi global  
**Perubahan:** Pembaruan kode  
**Lines:** 79-83

```javascript
// Line 76:
-         // Login gagal — tetap masuk tapi dengan static key sebagai fallback
+         // Login gagal — log error ke console dan sessionStorage untuk debugging
+         const errMsg = resJson.onfail?.cerror || resJson.message || JSON.stringify(resJson);
+         console.error('[signinAsGuest] Login gagal:', errMsg);
+         window.sessionStorage.setItem('qoGuestLoginError', errMsg);
+         // Fallback ke static key
```

---

#### 2. src/scripts/contexts/AuthContext.js [20260812_093434]
**Fungsi:** Context autentikasi global  
**Perubahan:** Tambah fungsi: signinAsGuest; Tambah error handling; Tambah HTTP request  
**Lines:** 32-33, 35-39, 44-97

```javascript
// Line 29:
-    * Tidak butuh form login. Gunakan secretkey dan user dari app.cfg.
-    * Dipanggil otomatis dari PrivateRoute saat URL punya ?table=XX.
+    * Melakukan login ke backend dengan credential dari app.cfg,
+    * sehingga secretkey yang dipakai valid untuk akses API.
-   const signinAsGuest = (cb) => {
-     const cfg        = getAppConfig();
-     const guestKey   = cfg.qr_session_key || '';
-     const guestUser  = cfg.qr_guest_user  || 'GUEST';
+   const signinAsGuest = async (cb) => {
+     const cfg       = getAppConfig();
+     const guestUser = cfg.qr_guest_user || '';
+     const guestPass = cfg.qr_guest_pass || '';
+ 
-     setLoggedIn(true);
-     setUserID(guestUser);
-     setSessionTimeout(false);
-     setSessionKey(guestKey);
-     setSessionID(guestKey);
-     if (typeof cb === 'function') cb();
+ 
+     if (!guestUser || !guestPass) {
+       // Fallback: pakai static key jika credential tidak dikonfigurasi
+       const staticKey = cfg.qr_session_key || '';
+       setLoggedIn(true);
  // ... (truncated)
+         setUserID(guestUser);
+         setSessionTimeout(false);
+         setSessionKey(resSessionKey);
+         setSessionID(resSessionID);
+         if (typeof cb === 'function') cb();
+       } else {
+         // Login gagal — tetap masuk tapi dengan static key sebagai fallback
+         const staticKey = cfg.qr_session_key || '';
+         setLoggedIn(true);
+         setUserID('GUEST');
+         setSessionTimeout(false);
+         setSessionKey(staticKey);
+         setSessionID(staticKey);
+         if (typeof cb === 'function') cb();
+       }
+     } catch (_) {
+       // Network error — fallback ke static key
+       const staticKey = cfg.qr_session_key || '';
+       setLoggedIn(true);
+       setUserID('GUEST');
+       setSessionTimeout(false);
+       setSessionKey(staticKey);
+       setSessionID(staticKey);
+       if (typeof cb === 'function') cb();
+     }
```

---

#### 3. src/scripts/utils/table-session.js [20260812_093434]
**Fungsi:** Utility: table-session  
**Perubahan:** Pembaruan kode  
**Lines:** 21-22, 29, 31

```javascript
// Line 18:
+  *
+  * @returns {boolean} true jika URL punya ?table= (scan baru), false jika tidak
+     return true; // scan baru dari URL
+   return false; // reload biasa, tidak ada ?table= di URL
```

---

#### 4. src/scripts/contexts/AuthContext.js [20260812_090252]
**Fungsi:** Context autentikasi global  
**Perubahan:** Import: app-config; Tambah fungsi: signinAsGuest; Akses localStorage  
**Lines:** 10, 24-25, 27-28, 30-49, 60, 62-63, 77-78, 99-102, 131-133, 135, 165, 176

```javascript
// Line 7:
+ import { getAppConfig } from '../utils/app-config';
// Line 21:
-   const [loggedIn, setLoggedIn] = useLocalStorage('loggedIn', false);
-   const [userID, setUserID] = useLocalStorage('userID', null);
+   const [loggedIn, setLoggedIn]           = useLocalStorage('loggedIn', false);
+   const [userID, setUserID]               = useLocalStorage('userID', null);
-   const [sessionKey, setSessionKey] = useLocalStorage('sessionKey', null);
-   const [sessionID, setSessionID] = useLocalStorage('sessionID', null);
+   const [sessionKey, setSessionKey]       = useLocalStorage('sessionKey', null);
+   const [sessionID, setSessionID]         = useLocalStorage('sessionID', null);
-   // const signin = async (data, cb, isForm) => {
-   //   setLoggedIn(true);
-   //   setUserID(data.cuserid);
-   //   setSessionTimeout(false);
-   //   setSessionKey('CSAComputerKeyword');
-   //   setSessionID('CSAComputerID');
-   //   cb();
-   // };
+   /**
+    * signinAsGuest — auto-login untuk pelanggan via QR scan.
+    * Tidak butuh form login. Gunakan secretkey dan user dari app.cfg.
+    * Dipanggil otomatis dari PrivateRoute saat URL punya ?table=XX.
+    */
+   const signinAsGuest = (cb) => {
  // ... (truncated)
-   //   setSessionTimeout(false);
-   //   setUserID(null);
-   //   setSessionKey(null);
-   //   setSessionID(null);
-   //   cb();
-   // };
- 
-     // Bersihkan credential fallback saat logout
-     // Bersihkan data BQO saat logout — pelanggan berikutnya mulai fresh
// Line 128:
-           'x-user': Config.SESSION_USER(),
-           secretkey: Config.SESSION_KEY(),
-           sessionid: Config.SESSION_ID(),
+           'x-user':    Config.SESSION_USER(),
+           secretkey:   Config.SESSION_KEY(),
+           sessionid:   Config.SESSION_ID(),
-         body: JSON.stringify({
-           action: 'logout',
-         }),
+         body: JSON.stringify({ action: 'logout' }),
// Line 162:
-     onIdle: handleOnIdle,
+     onIdle:  handleOnIdle,
// Line 173:
+     signinAsGuest,
```

---

### 🔌 API

#### 1. src/scripts/routes/PrivateRoute.js [20260812_105611]
**Fungsi:** Route: PrivateRoute  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Import: ProgressLoader  
**Lines:** 1, 5, 8-16, 19-21, 23-24, 28-32, 34-35

```javascript
// Line 1:
- import { useEffect } from 'react';
+ import { useEffect, useState } from 'react';
+ import ProgressLoader from '../components/ProgressLoader';
-   const auth         = useAuth();
-   const location     = useLocation();
-   const navigate     = useNavigate();
-   const tableId      = getTableId();
-   const isQRMode     = tableId !== '';
+   const auth        = useAuth();
+   const location    = useLocation();
+   const navigate    = useNavigate();
+   const tableId     = getTableId();
+   const isQRMode    = tableId !== '';
+ 
+   // State untuk track proses auto-login yang sedang berjalan
+   const [isSigningIn, setIsSigningIn] = useState(false);
+   const [signInDone,  setSignInDone]  = useState(false);
-     // Jika ada ?table= di URL (mode QR) dan belum login → auto-login sebagai guest
-     if (isQRMode && !auth.loggedIn) {
+     // Jika mode QR dan belum login dan belum pernah dicoba → jalankan auto-login
+     if (isQRMode && !auth.loggedIn && !isSigningIn && !signInDone) {
+       setIsSigningIn(true);
-         // Setelah auto-login, lanjut ke tujuan semula
+         setIsSigningIn(false);
+         setSignInDone(true);
-   }, [isQRMode, auth, location.pathname, navigate]);
+   // eslint-disable-next-line react-hooks/exhaustive-deps
+   }, [isQRMode, auth.loggedIn]);
+ 
+   // Sedang proses login → tampilkan loader
+   if (isSigningIn) return <ProgressLoader />;
-   // Mode QR: sedang proses auto-login → render null (tunggu sebentar)
-   if (isQRMode && !auth.loggedIn) return null;
+   // Mode QR: belum login dan belum dicoba → loader sementara
+   if (isQRMode && !auth.loggedIn && !signInDone) return <ProgressLoader />;
```

---

#### 2. src/scripts/routes/PrivateRoute.js [20260812_090252]
**Fungsi:** Route: PrivateRoute  
**Perubahan:** Import: react; Tambah side effect; Import: react-router-dom; Import: table-session; Tambah navigasi halaman  
**Lines:** 1-2, 4, 7-31

```javascript
// Line 1:
- import { useLocation, Navigate } from 'react-router-dom';
+ import { useEffect } from 'react';
+ import { useLocation, Navigate, useNavigate } from 'react-router-dom';
+ import { getTableId } from '../utils/table-session';
-   let isAuthenticated = useAuth().loggedIn;
-   let location = useLocation();
-   return isAuthenticated ? children : <Navigate to={{
-     pathname: '/login',
-     state: { from: location },
-   }} />
+   const auth         = useAuth();
+   const location     = useLocation();
+   const navigate     = useNavigate();
+   const tableId      = getTableId();
+   const isQRMode     = tableId !== '';
+ 
+   useEffect(() => {
+     // Jika ada ?table= di URL (mode QR) dan belum login → auto-login sebagai guest
+     if (isQRMode && !auth.loggedIn) {
+       auth.signinAsGuest(() => {
+         // Setelah auto-login, lanjut ke tujuan semula
+         navigate(location.pathname, { replace: true });
+       });
+     }
+   }, [isQRMode, auth, location.pathname, navigate]);
+ 
+   // Mode QR: sedang proses auto-login → render null (tunggu sebentar)
+   if (isQRMode && !auth.loggedIn) return null;
+ 
+   // Mode biasa: belum login → redirect ke form login
+   if (!auth.loggedIn) {
+     return <Navigate to={{ pathname: '/login', state: { from: location } }} />;
+   }
+ 
+   return children;
```

---

### ⚙️ Others

#### 1. public/app.cfg [20260812_140437]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 13-14

```javascript
// Line 10:
-   "debug_screen": true
+   "debug_screen": true,
+   "show_print_button": false
```

---

#### 2. src/scripts/utils/app-config.js [20260812_140437]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 28-29

```javascript
// Line 25:
-   debug_screen:                  false, // true = tampilkan debug panel di layar
+   debug_screen:                  false,
+   show_print_button:             true,  // false = sembunyikan tombol print di struk kasir
```

---

#### 3. public/app.cfg [20260812_114806]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 10-12

```javascript
// Line 7:
-   "qr_session_key": "78dfcc919bfa35f1852da50f7c6d4d14",
-   "qr_guest_user": "xsv4",
-   "qr_guest_pass": "xsv4",
+   "qr_session_key": "8c5cf26a7040c57dd4ae2e0feeec76e1",
+   "qr_guest_user": "xsv1",
+   "qr_guest_pass": "xsv1",
```

---

#### 4. public/qr-tables.html [20260812_103649]
**Fungsi:** Fungsi: setMode  
**Perubahan:** Tambah fungsi: setMode  
**Lines:** 31-78, 84, 146-163, 171, 203, 213-215, 238-246, 250, 273-307, 313-318, 333, 335, 346-351

```javascript
// Line 28:
+     /* ── Mode Toggle ──────────────────────────────────────────────── */
+     .mode-toggle {
+       display: flex;
+       justify-content: center;
+       gap: 8px;
+       margin-bottom: 16px;
+     }
+ 
+     .mode-toggle button {
+       padding: 6px 18px;
+       border: 2px solid #3f50b5;
+       border-radius: 20px;
+       background: #fff;
+       color: #3f50b5;
+       cursor: pointer;
+       font-size: 0.85rem;
+       font-weight: 600;
+       transition: all .15s;
+     }
+ 
+     .mode-toggle button.active {
+       background: #3f50b5;
+       color: #fff;
+     }
  // ... (truncated)
-       const startNum   = parseInt(document.getElementById('tableStart').value) || 1;
-       const grid       = document.getElementById('qrGrid');
+       const baseUrl   = document.getElementById('baseUrl').value.trim();
+       const restoName = document.getElementById('restoName').value.trim() || 'Qoresto';
+       const count     = parseInt(document.getElementById('tableCount').value) || 10;
+       const startNum  = parseInt(document.getElementById('tableStart').value) || 1;
+       const grid      = document.getElementById('qrGrid');
+       const isDev     = currentMode === 'dev';
// Line 330:
-         card.className = 'card';
+         card.className = isDev ? 'card dev-card' : 'card';
+           <div class="mode-label ${isDev ? 'dev' : 'prod'}">${isDev ? '🛠 DEV' : '🏪 PROD'}</div>
// Line 343:
-           text:          url,
-           width:         150,
-           height:        150,
-           colorDark:     '#222222',
-           colorLight:    '#ffffff',
-           correctLevel:  QRCode.CorrectLevel.M,
+           text:         url,
+           width:        150,
+           height:       150,
+           colorDark:    isDev ? '#c0390b' : '#222222',  // merah untuk dev, hitam untuk prod
+           colorLight:   '#ffffff',
+           correctLevel: QRCode.CorrectLevel.M,
```

---

#### 5. public/app.cfg [20260812_101813]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 12-13

```javascript
// Line 9:
-   "qr_guest_pass": "xsv4"
+   "qr_guest_pass": "xsv4",
+   "debug_screen": true
```

---

#### 6. src/scripts/utils/app-config.js [20260812_101813]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 25, 27-28

```javascript
// Line 22:
-   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
+   qr_session_key:                '',
-   qr_guest_pass:                 '',    // password untuk login guest via QR
+   qr_guest_pass:                 '',
+   debug_screen:                  false, // true = tampilkan debug panel di layar
```

---

#### 7. public/app.cfg [20260812_093434]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 11-12

```javascript
// Line 8:
-   "qr_guest_user": "GUEST"
+   "qr_guest_user": "xsv4",
+   "qr_guest_pass": "xsv4"
```

---

#### 8. src/scripts/App.js [20260812_093434]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Akses localStorage  
**Lines:** 24-34

```javascript
// Line 21:
-     initTableId(); // baca ?table=XX dari URL, simpan ke sessionStorage
+     const isNewScan = initTableId(); // baca ?table=XX dari URL, simpan ke sessionStorage
+     if (isNewScan) {
+       // Scan QR baru — reset semua data sesi pelanggan sebelumnya agar mulai fresh
+       window.localStorage.removeItem('QoCart');
+       window.localStorage.removeItem('QoOrderInfo');
+       window.localStorage.removeItem('QoReturnPath');
+       window.localStorage.removeItem('loggedIn');
+       window.localStorage.removeItem('sessionKey');
+       window.localStorage.removeItem('sessionID');
+       window.localStorage.removeItem('userID');
+     }
```

---

#### 9. src/scripts/utils/app-config.js [20260812_093434]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 27

```javascript
// Line 24:
+   qr_guest_pass:                 '',    // password untuk login guest via QR
```

---

#### 10. public/qr-tables.html [20260812_091046]
**Fungsi:** Fungsi: padNum  
**Perubahan:** Tambah fungsi: padNum; Tambah fungsi: generate  
**Lines:** 1-245

```javascript
// Line 1:
+ <!DOCTYPE html>
+ <html lang="id">
+ <head>
+   <meta charset="UTF-8" />
+   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+   <title>QR Code Meja — Qoresto</title>
+   <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
+   <style>
+     * { box-sizing: border-box; margin: 0; padding: 0; }
+ 
+     body {
+       font-family: 'Segoe UI', Arial, sans-serif;
+       background: #f0f0f0;
+       padding: 20px;
+     }
+ 
+     h1 {
+       text-align: center;
+       margin-bottom: 8px;
+       color: #3f50b5;
+       font-size: 1.4rem;
+     }
+ 
+     .subtitle {
  // ... (truncated)
+           <div class="table-label">Meja ${tableId}</div>
+           <div class="qr-wrapper" id="qr-${tableId}"></div>
+           <div class="url-text">${url}</div>
+           <div class="scan-hint">📱 Scan untuk memesan</div>
+         `;
+         grid.appendChild(card);
+ 
+         // Generate QR
+         new QRCode(document.getElementById(`qr-${tableId}`), {
+           text:          url,
+           width:         150,
+           height:        150,
+           colorDark:     '#222222',
+           colorLight:    '#ffffff',
+           correctLevel:  QRCode.CorrectLevel.M,
+         });
+       }
+     }
+ 
+     // Auto-generate saat halaman load
+     window.addEventListener('load', generate);
+   </script>
+ 
+ </body>
+ </html>
```

---

#### 11. public/app.cfg [20260812_090252]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 9-11

```javascript
// Line 6:
-   "use_mock_bqo": false
+   "use_mock_bqo": false,
+   "qr_session_key": "78dfcc919bfa35f1852da50f7c6d4d14",
+   "qr_guest_user": "GUEST"
```

---

#### 12. src/scripts/App.js [20260812_090252]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Import: table-session  
**Lines:** 12, 50-54

```javascript
// Line 9:
- import { initTableId } from './utils/table-session';
+ import { initTableId, getTableId } from './utils/table-session';
// Line 47:
-               <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
+               <Route path="/" element={
+                 getTableId()
+                   ? <Navigate to="/menu" replace />        // QR scan → langsung ke menu
+                   : <PrivateRoute><Home /></PrivateRoute>  // akses biasa → home (butuh login)
+               } />
```

---

#### 13. src/scripts/utils/app-config.js [20260812_090252]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 25-26

```javascript
// Line 22:
+   qr_session_key:                '',    // secret key untuk akses via QR (tanpa login)
+   qr_guest_user:                 'GUEST',
```

---

## 📊 **Summary**
- **✨ Features:** 15 items
- **📖 Documentation:** 15 items
- **🔐 Auth/Session:** 4 items
- **🔌 API:** 2 items
- **⚙️ Others:** 13 items
- **Total Files Modified:** 49
- **Main Focus:** Features
