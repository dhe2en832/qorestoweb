# Code Changes Summary

## 29 Juli 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/hooks/usePrintReceipt.js [20260729_131609]
**Fungsi:** Custom hook: usePrintReceipt  
**Perubahan:** Import: react; Tambah state management; Tambah error handling  
**Lines:** 1-55

```javascript
// Line 1:
+ /**
+  * usePrintReceipt.js
+  *
+  * Hook untuk print struk restoran (thermal 80mm).
+  * Menggunakan window.print() dengan inline style — tidak butuh library tambahan
+  * agar tidak bergantung jaringan saat server mati.
+  */
+ 
+ import { useRef, useState, useCallback } from 'react';
+ 
+ export default function usePrintReceipt({ callbackAfterPrint } = {}) {
+   const printComponentRef = useRef();
+   const [printCount, setPrintCount] = useState(0);
+ 
+   const handlePrint = useCallback(() => {
+     const content = printComponentRef.current;
+     if (!content) return;
+ 
+     const printWindow = window.open('', '_blank', 'width=400,height=600');
+     if (!printWindow) {
+       alert('Pop-up diblokir browser. Izinkan pop-up untuk mencetak struk.');
+       return;
+     }
+ 
  // ... (truncated)
+           <style>
+             @page { size: 80mm auto; margin: 0; }
+             * { box-sizing: border-box; padding: 0; margin: 0; color: black; }
+             body { font-family: monospace; font-size: 10px; width: 80mm; }
+           </style>
+         </head>
+         <body>${content.innerHTML}</body>
+       </html>
+     `);
+     printWindow.document.close();
+     printWindow.focus();
+ 
+     // Tunggu load selesai lalu print
+     printWindow.onload = () => {
+       printWindow.print();
+       printWindow.close();
+       setPrintCount((prev) => prev + 1);
+       if (callbackAfterPrint) {
+         Promise.resolve().then(() => callbackAfterPrint()).catch(() => {});
+       }
+     };
+   }, [callbackAfterPrint]);
+ 
+   return { printComponentRef, handlePrint, printCount };
+ }
```

---

#### 2. src/scripts/modules/BQO/hooks/useXenditPayment.js [20260729_131609]
**Fungsi:** Custom hook: useXenditPayment  
**Perubahan:** Import: react; Tambah state management; Import: AlertDialog; Import: app-config; Import: payment-api; Tambah fungsi: XENDIT_MODE; Tambah fungsi: buildUrl; Tambah fungsi: doCheck; Tambah error handling; Tambah fungsi: getXenditPaymentMap; Tambah fungsi: handleCheckIsXenditPayment; Tambah fungsi: handleFetchXenditPayment  
**Lines:** 1-303

```javascript
// Line 1:
+ /**
+  * useXenditPayment.js
+  *
+  * Hook untuk mengelola lifecycle pembayaran Xendit:
+  * create payment → SSE/polling status → callback sukses/gagal
+  *
+  * XENDIT_MODE (via REACT_APP_XENDIT_MODE):
+  *   'invoice'         → create-invoice.php  (customer buka link, pilih metode)
+  *   'payment-request' → create-payment-request.php  (QR/VA langsung di layar)
+  */
+ 
+ import { useCallback, useRef, useState } from 'react';
+ import AlertDialog from '../../../components/AlertDialog';
+ import { getAppConfig } from '../../../utils/app-config';
+ import { fetchPaymentAPI, getPaymentAPIUrl, PRIMARY_BASE_URL, LOCAL_BASE_URL } from '../../../utils/payment-api';
+ 
+ const XENDIT_MODE = (process.env.REACT_APP_XENDIT_MODE || 'invoice').trim();
+ 
+ // Mapping channel → tipe Xendit
+ const XENDIT_PAYMENT_MAP = {
+   QRIS:      { type: 'qris',    endpoint: '/create-payment-request.php' },
+   BCA:       { type: 'va',      endpoint: '/create-payment-request.php' },
+   BNI:       { type: 'va',      endpoint: '/create-payment-request.php' },
+   BRI:       { type: 'va',      endpoint: '/create-payment-request.php' },
  // ... (truncated)
+           AlertDialog('error', 'ERROR', msg);
+         } else {
+           AlertDialog('error', 'ERROR', error?.message || JSON.stringify(error));
+         }
+       } else {
+         AlertDialog('error', 'ERROR', String(error));
+       }
+     } finally {
+       setIsLoadingXenditPayment(false);
+     }
+   };
+ 
+   const cleanup = useCallback(() => stopStatusListener(), [stopStatusListener]);
+ 
+   return {
+     xenditPaymentInfo,
+     isLoadingXenditPayment,
+     handleCheckIsXenditPayment,
+     handleFetchXenditPayment,
+     handleCheckXenditStatus,
+     resetXenditPaymentInfo,
+     isSSEActive: !!sseRef.current,
+     cleanup,
+   };
+ }
```

---

#### 3. src/scripts/modules/BQO/index.js [20260729_131609]
**Fungsi:** Entry point / registrasi React  
**Perubahan:** Import: bqo_payment  
**Lines:** 6, 13, 15-16

```javascript
// Line 3:
+ import BQOPayment from './views/bqo_payment';
-                     <Route path={"/menu"} element={<BQOHome />} />
+                     <Route path={"/menu"}     element={<BQOHome />} />
-                     <Route path="*" element={<Navigate to="/404" />} />
+                     <Route path={"/payment"}  element={<BQOPayment />} />
+                     <Route path="*"           element={<Navigate to="/404" />} />
```

---

#### 4. src/scripts/modules/BQO/reports/BQOReceipt.jsx [20260729_131609]
**Fungsi:** Modul: BQOReceipt  
**Perubahan:** Import: react; Import: formatter; Tambah fungsi: pad; Tambah fungsi: ReceiptBody; Ubah render/return JSX  
**Lines:** 1-224

```javascript
// Line 1:
+ import React, { forwardRef } from 'react';
+ import { toCurrencyIDR } from '../../../utils/formatter';
+ 
+ /**
+  * BQOReceipt — Komponen struk restoran untuk cetak (thermal 80mm).
+  *
+  * Props:
+  *   datas.cart            - array item pesanan { item, qty, note? }
+  *   datas.orderInfo       - { seatNumber, orderByName, phoneNumber }
+  *   datas.subtotal        - number (sebelum pajak)
+  *   datas.taxAmount       - number
+  *   datas.total           - number (grand total)
+  *   datas.paymentMethod   - string (nama metode bayar)
+  *   datas.nomorBon        - string (nomor bon dari backend, atau externalId)
+  *   datas.isLocalServer   - bool (true = cetak dari server cadangan)
+  *   datas.showArchiveCopy - bool (true = tampilkan salinan arsip)
+  *   datas.isUnrecorded    - bool (true = watermark BELUM TEREKAM)
+  */
+ const BQOReceipt = forwardRef(function BQOReceipt({ datas = {} }, ref) {
+   const {
+     cart = [],
+     orderInfo = {},
+     subtotal = 0,
+     taxAmount = 0,
  // ... (truncated)
+     fontWeight: 'bold',
+   },
+   itemNote: {
+     fontSize: '9px',
+     color: '#555',
+     fontStyle: 'italic',
+   },
+   footerSmall: {
+     fontSize: '9px',
+     color: '#777',
+     marginTop: '4px',
+   },
+   archiveBadge: {
+     fontSize: '9px',
+     fontWeight: 'bold',
+     marginTop: '4px',
+   },
+   pageCut: {
+     textAlign: 'center',
+     fontSize: '9px',
+     margin: '8px 0',
+   },
+ };
+ 
+ export default BQOReceipt;
```

---

#### 5. src/scripts/modules/BQO/views/bqo_checkout.js [20260729_131609]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: DialogTitle; Import: Divider; Import: PointOfSale; Import: PhoneAndroid; Tambah state management; Tambah fungsi: handleOnCheckout; Tambah fungsi: handlePayAtKasir; Tambah error handling; Akses localStorage; Tambah navigasi halaman; Tambah fungsi: handlePaySelf  
**Lines:** 7, 15, 22-23, 233-236, 249-276, 278-282, 514-519, 562-651

```javascript
// Line 4:
+ import DialogTitle from '@mui/material/DialogTitle';
// Line 12:
+ import Divider from '@mui/material/Divider';
+ import CashierIcon from '@mui/icons-material/PointOfSale';
+ import SelfPayIcon from '@mui/icons-material/PhoneAndroid';
// Line 230:
-   const handleOnCheckout = async () => {
+   // Dialog pilihan metode bayar: kasir vs mandiri
+   const [showPaymentMethodDlg, setShowPaymentMethodDlg] = useState(false);
+ 
+   const handleOnCheckout = () => {
// Line 246:
+     // Tampilkan dialog pilihan: bayar di kasir atau mandiri
+     setShowPaymentMethodDlg(true);
+   };
+ 
+   // Bayar di kasir — submit pesanan ke backend, tanpa halaman payment
+   const [isSubmittingKasir, setIsSubmittingKasir] = useState(false);
+   const handlePayAtKasir = async () => {
+     setShowPaymentMethodDlg(false);
+     setIsSubmittingKasir(true);
+     try {
+       const payload = { info, cart: Object.values(cart) };
+       const result = await bqo_api.add(payload);
  // ... (truncated)
+               '&:hover': { borderWidth: 2, bgcolor: '#f0fff4' },
+             }}
+           >
+             <SelfPayIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
+             <div style={{ textAlign: 'left' }}>
+               <Typography variant="body1" fontWeight={600} color="text.primary">
+                 Bayar Sendiri (Mandiri)
+               </Typography>
+               <Typography variant="caption" color="text.secondary">
+                 Bayar sekarang lewat QRIS, transfer,{'\n'}
+                 atau metode digital lainnya.
+               </Typography>
+             </div>
+           </Button>
+         </DialogContent>
+         <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
+           <Button
+             size="small"
+             color="inherit"
+             onClick={() => setShowPaymentMethodDlg(false)}
+           >
+             Batal
+           </Button>
+         </DialogActions>
+       </Dialog>
```

---

#### 6. src/scripts/modules/BQO/views/bqo_payment.js [20260729_131609]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Import: react-router-dom; Import: Container; Import: AppBar; Import: Toolbar; Import: Grid; Import: Box; Import: Typography; Import: Button; Import: IconButton; Import: Divider; Import: CircularProgress; Import: Alert; Import: List; Import: ListItem; Import: ListItemButton; Import: ListItemText; Import: ArrowBackIos; Import: Print; Import: CheckCircle; Import: Payment; Import: Money; Import: QrCode; Import: Refresh; Import: ToastBar; Import: AlertDialog; Import: ConfirmDialog; Import: bqo_api; Import: useXenditPayment; Import: usePrintReceipt; Import: failed-trx-download; Import: app-config; Import: formatter; Import: BQOReceipt; Tambah fungsi: CASH_BANK_CODE; Tambah fungsi: XENDIT_BANK_CODE; Akses localStorage; Tambah navigasi halaman; Tambah fungsi: fetchBanks; Tambah error handling; Ubah render/return JSX; Tambah HTTP request; Tambah fungsi: handleDownloadAndComplete; Tambah fungsi: buildPayload; Tambah fungsi: executeSave; Tambah fungsi: handleSaveToLocal; Tambah fungsi: handlePayTunai; Tambah fungsi: handleSelectXenditChannel; Tambah fungsi: handleNewOrder; Tambah fungsi: doProceed; Tambah fungsi: renderSummary; Tambah fungsi: renderChooseView; Tambah fungsi: renderTunaiView; Tambah fungsi: renderXenditChannelView; Tambah fungsi: renderXenditWaitingView; Tambah fungsi: renderPaidView  
**Lines:** 1-606

```javascript
// Line 1:
+ import React, { useState, useEffect, useRef, useCallback } from 'react';
+ import { useNavigate } from 'react-router-dom';
+ import Container from '@mui/material/Container';
+ import AppBar from '@mui/material/AppBar';
+ import Toolbar from '@mui/material/Toolbar';
+ import Grid from '@mui/material/Grid';
+ import Box from '@mui/material/Box';
+ import Typography from '@mui/material/Typography';
+ import Button from '@mui/material/Button';
+ import IconButton from '@mui/material/IconButton';
+ import Divider from '@mui/material/Divider';
+ import CircularProgress from '@mui/material/CircularProgress';
+ import Alert from '@mui/material/Alert';
+ import List from '@mui/material/List';
+ import ListItem from '@mui/material/ListItem';
+ import ListItemButton from '@mui/material/ListItemButton';
+ import ListItemText from '@mui/material/ListItemText';
+ import BackIcon from '@mui/icons-material/ArrowBackIos';
+ import PrintIcon from '@mui/icons-material/Print';
+ import CheckCircleIcon from '@mui/icons-material/CheckCircle';
+ import PaymentIcon from '@mui/icons-material/Payment';
+ import MoneyIcon from '@mui/icons-material/Money';
+ import QrCodeIcon from '@mui/icons-material/QrCode';
+ import RefreshIcon from '@mui/icons-material/Refresh';
  // ... (truncated)
+           </Grid>
+         </Toolbar>
+       </AppBar>
+ 
+       {/* Content */}
+       <Box sx={{ paddingTop: '56px', paddingBottom: '40px', background: '#eee', minHeight: '100vh' }}>
+         {isPaid
+           ? renderPaidView()
+           : activeView === 'choose'         ? renderChooseView()
+           : activeView === 'tunai'          ? renderTunaiView()
+           : activeView === 'xendit-channel' ? renderXenditChannelView()
+           : activeView === 'xendit-waiting' ? renderXenditWaitingView()
+           : renderChooseView()
+         }
+ 
+         {/* Copyright */}
+         <Container sx={{ mt: 4 }}>
+           <Typography color="#b7b7b7" variant="body2" textAlign="center">
+             Powered By <b style={{ color: '#3f50b5' }}>CSA Computer</b>
+           </Typography>
+         </Container>
+       </Box>
+     </>
+   );
+ }
```

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260729.md [20260729_133927]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Akses localStorage; Hapus debug log  
**Lines:** 331-429, 490, 551, 612, 673, 734, 982-1011, 1056, 1117, 1135, 1148-1150, 1341, 1343-1345

```javascript
// Line 328:
- #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_132557]
+ #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_133715]
+ **Fungsi:** Implementasi: codeChange-20260729  
+ **Perubahan:** Akses localStorage; Tambah state management  
+ **Lines:** 331-392, 453, 514, 575, 636, 693-696, 699-717, 719-725, 1058-1073, 1259-1264, 1267, 1269-1272
+ 
+ ```javascript
+ // Line 328:
+ - #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_131609]
+ + #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_132557]
+ + **Fungsi:** Implementasi: codeChange-20260729  
+ + **Perubahan:** Tambah state management; Tambah error handling; Akses localStorage; Tambah side effect; Tambah HTTP request  
+ + **Lines:** 7-129, 146-207, 268-325, 329-388, 392-449, 453-454, 456, 458-510, 512, 514, 575, 632-635, 637-689, 695-698, 702-725, 730, 791, 803, 805-856, 858-878, 884, 887, 890-924, 929-990, 1008-1017, 1023-1039, 1043-1063, 1084, 1086-1087, 1089-1141, 1145, 1147-1202, 1208-1212
+ + 
+ + ```javascript
+ + // Line 4:
+ + - #### 1. src/scripts/modules/BQO/index.js [20260729_131606]
+ + + #### 1. src/scripts/modules/BQO/hooks/usePrintReceipt.js [20260729_131609]
+ + + **Fungsi:** Custom hook: usePrintReceipt  
+ + + **Perubahan:** Import: react; Tambah state management; Tambah error handling  
+ + + **Lines:** 1-55
+ + + 
+ + + ```javascript
+ + + // Line 1:
  // ... (truncated)
- ```javascript
- // Line 33:
- - const BUILD_DIR  = path.join(ROOT, 'build');
- + const BUILD_DIR  = path.join(ROOT, isCadangan ? 'build-cadangan' : 'build');
- // Line 115:
- - console.log(`║  📁  Output: ./build/`.padEnd(51) + '║');
- + console.log(`║  📁  Output: ./${isCadangan ? 'build-cadangan' : 'build'}/`.padEnd(51) + '║');
- ```
+ #### 7. uild-deploy.cjs [20260729_133925]
+ **Fungsi:** Implementasi: uild-deploy  
+ **Perubahan:** Pembaruan kode  
// Line 1336:
- #### 6. env-cmdrc [20260729_133713]
- **Fungsi:** Implementasi: env-cmdrc  
- **Perubahan:** Ubah konfigurasi environment / API endpoint  
- 
- 
- - **📖 Documentation:** 7 items
+ - **📖 Documentation:** 8 items
- - **⚙️ Config:** 5 items
- - **⚙️ Others:** 6 items
- - **Total Files Modified:** 29
+ - **⚙️ Config:** 7 items
+ - **⚙️ Others:** 5 items
+ - **Total Files Modified:** 31
```

---

#### 2. docs/changelog/daily/codeChange-20260729.md [20260729_133715]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Akses localStorage; Tambah state management  
**Lines:** 331-392, 453, 514, 575, 636, 693-696, 699-717, 719-725, 1058-1073, 1259-1264, 1267, 1269-1272

```javascript
// Line 328:
- #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_131609]
+ #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_132557]
+ **Fungsi:** Implementasi: codeChange-20260729  
+ **Perubahan:** Tambah state management; Tambah error handling; Akses localStorage; Tambah side effect; Tambah HTTP request  
+ **Lines:** 7-129, 146-207, 268-325, 329-388, 392-449, 453-454, 456, 458-510, 512, 514, 575, 632-635, 637-689, 695-698, 702-725, 730, 791, 803, 805-856, 858-878, 884, 887, 890-924, 929-990, 1008-1017, 1023-1039, 1043-1063, 1084, 1086-1087, 1089-1141, 1145, 1147-1202, 1208-1212
+ 
+ ```javascript
+ // Line 4:
+ - #### 1. src/scripts/modules/BQO/index.js [20260729_131606]
+ + #### 1. src/scripts/modules/BQO/hooks/usePrintReceipt.js [20260729_131609]
+ + **Fungsi:** Custom hook: usePrintReceipt  
+ + **Perubahan:** Import: react; Tambah state management; Tambah error handling  
+ + **Lines:** 1-55
+ + 
+ + ```javascript
+ + // Line 1:
+ + + /**
+ + +  * usePrintReceipt.js
+ + +  *
+ + +  * Hook untuk print struk restoran (thermal 80mm).
+ + +  * Menggunakan window.print() dengan inline style — tidak butuh library tambahan
+ + +  * agar tidak bergantung jaringan saat server mati.
+ + +  */
+ + + 
  // ... (truncated)
+ + const BUILD_DIR  = path.join(ROOT, isCadangan ? 'build-cadangan' : 'build');
+ // Line 115:
+ - console.log(`║  📁  Output: ./build/`.padEnd(51) + '║');
+ + console.log(`║  📁  Output: ./${isCadangan ? 'build-cadangan' : 'build'}/`.padEnd(51) + '║');
+ ```
+ 
+ ---
+ 
// Line 1256:
+ #### 6. env-cmdrc [20260729_133713]
+ **Fungsi:** Implementasi: env-cmdrc  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ 
+ ---
+ 
- - **📖 Documentation:** 6 items
+ - **📖 Documentation:** 7 items
- - **⚙️ Config:** 4 items
- - **⚙️ Others:** 5 items
- - **Total Files Modified:** 26
- - **Main Focus:** Features
+ - **⚙️ Config:** 5 items
+ - **⚙️ Others:** 6 items
+ - **Total Files Modified:** 29
+ - **Main Focus:** 📖 Documentation
```

---

#### 3. docs/panduan-build-dan-development.md [20260729_133715]
**Fungsi:** Implementasi: panduan-build-dan-development  
**Perubahan:** Pembaruan kode  
**Lines:** 189, 204, 210-213, 240, 242

```javascript
// Line 186:
- build/
+ build-cadangan/
// Line 201:
- > ⚠️ Build ini menjalankan dua proses secara **berurutan**. Setelah `build:primary` selesai, langsung dilanjutkan `build:cadangan`. Folder `build/` akhir berisi versi **cadangan** (yang terakhir dijalankan).
+ > ⚠️ Build ini menjalankan dua proses secara **berurutan**. Hasil masing-masing tersimpan di folder terpisah — tidak saling menimpa.
- **Jika perlu menyimpan kedua versi secara terpisah**, jalankan manual dan pindahkan folder build sebelum build berikutnya:
- 
- ```bash
- # Build utama
- yarn build:primary
- # Rename/pindahkan hasil
- move build build-primary
- 
- # Build cadangan
- yarn build:cadangan
- # Rename/pindahkan hasil
- move build build-cadangan
+ Hasil:
+ ```
+ build/            ← versi PRIMARY (URL: /qorestoweb/)
+ build-cadangan/   ← versi CADANGAN (URL: /qorestoweb-cad/)
// Line 237:
- Gunakan hasil `yarn build:cadangan`, salin ke:
+ Gunakan hasil `yarn build:cadangan`, salin isi `build-cadangan/` ke:
- /var/www/html/qorestoweb/
+ /var/www/html/qorestoweb-cad/
```

---

#### 4. docs/changelog/daily/codeChange-20260729.md [20260729_132557]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Tambah state management; Tambah error handling; Akses localStorage; Tambah side effect; Tambah HTTP request  
**Lines:** 7-129, 146-207, 268-325, 329-388, 392-449, 453-454, 456, 458-510, 512, 514, 575, 632-635, 637-689, 695-698, 702-725, 730, 791, 803, 805-856, 858-878, 884, 887, 890-924, 929-990, 1008-1017, 1023-1039, 1043-1063, 1084, 1086-1087, 1089-1141, 1145, 1147-1202, 1208-1212

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/index.js [20260729_131606]
+ #### 1. src/scripts/modules/BQO/hooks/usePrintReceipt.js [20260729_131609]
+ **Fungsi:** Custom hook: usePrintReceipt  
+ **Perubahan:** Import: react; Tambah state management; Tambah error handling  
+ **Lines:** 1-55
+ 
+ ```javascript
+ // Line 1:
+ + /**
+ +  * usePrintReceipt.js
+ +  *
+ +  * Hook untuk print struk restoran (thermal 80mm).
+ +  * Menggunakan window.print() dengan inline style — tidak butuh library tambahan
+ +  * agar tidak bergantung jaringan saat server mati.
+ +  */
+ + 
+ + import { useRef, useState, useCallback } from 'react';
+ + 
+ + export default function usePrintReceipt({ callbackAfterPrint } = {}) {
+ +   const printComponentRef = useRef();
+ +   const [printCount, setPrintCount] = useState(0);
+ + 
+ +   const handlePrint = useCallback(() => {
+ +     const content = printComponentRef.current;
  // ... (truncated)
+ +       a.download = filename;
+ +       a.click();
+ +       URL.revokeObjectURL(url);
+ + 
+ +       setIsDownloaded(true);
+ +     } catch (err) {
+ +       console.error('Gagal download transaksi:', err);
+ +     }
+ +   };
+ + 
+ +   const resetDownloadState = () => setIsDownloaded(false);
+ + 
+ +   return { isDownloaded, downloadFailedTrx, resetDownloadState };
+ + }
+ ```
- - **📖 Documentation:** 4 items
- - **🔌 API:** 4 items
- - **⚙️ Config:** 3 items
- - **⚙️ Others:** 6 items
- - **Total Files Modified:** 23
+ - **📖 Documentation:** 6 items
+ - **🔌 API:** 5 items
+ - **⚙️ Config:** 4 items
+ - **⚙️ Others:** 5 items
+ - **Total Files Modified:** 26
```

---

#### 5. docs/changelog/daily/codeChange-20260729.md [20260729_131609]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Akses localStorage; Tambah state management; Tambah error handling; Tambah HTTP request; Tambah side effect  
**Lines:** 5-108, 111-172, 229-240, 270-348, 364-440, 442-448

```javascript
// Line 2:
+ ### ✨ Features
+ 
+ #### 1. src/scripts/modules/BQO/index.js [20260729_131606]
+ **Fungsi:** Entry point / registrasi React  
+ **Perubahan:** Import: bqo_payment  
+ **Lines:** 6, 13, 15-16
+ 
+ ```javascript
+ // Line 3:
+ + import BQOPayment from './views/bqo_payment';
+ -                     <Route path={"/menu"} element={<BQOHome />} />
+ +                     <Route path={"/menu"}     element={<BQOHome />} />
+ -                     <Route path="*" element={<Navigate to="/404" />} />
+ +                     <Route path={"/payment"}  element={<BQOPayment />} />
+ +                     <Route path="*"           element={<Navigate to="/404" />} />
+ ```
+ 
+ ---
+ 
+ #### 2. src/scripts/modules/BQO/views/bqo_checkout.js [20260729_131606]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: DialogTitle; Import: Divider; Import: PointOfSale; Import: PhoneAndroid; Tambah state management; Tambah fungsi: handleOnCheckout; Tambah fungsi: handlePayAtKasir; Tambah error handling; Akses localStorage; Tambah navigasi halaman; Tambah fungsi: handlePaySelf  
+ **Lines:** 7, 15, 22-23, 233-236, 249-276, 278-282, 514-519, 562-651
+ 
  // ... (truncated)
+ 
+ #### 5. src/scripts/utils/app-config.js [20260729_131606]
+ **Fungsi:** Entry point aplikasi React  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ #### 6. src/scripts/utils/failed-trx-download.js [20260729_131606]
+ **Fungsi:** Utility: failed-trx-download  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- - **📖 Documentation:** 1 item
- - **🔌 API:** 1 item
- - **⚙️ Config:** 1 item
- - **Total Files Modified:** 3
- - **Main Focus:** 📖 Documentation
+ - **✨ Features:** 6 items
+ - **📖 Documentation:** 4 items
+ - **🔌 API:** 4 items
+ - **⚙️ Config:** 3 items
+ - **⚙️ Others:** 6 items
+ - **Total Files Modified:** 23
+ - **Main Focus:** Features
```

---

#### 6. docs/major-update-payment-dualserver-print.md [20260729_131609]
**Fungsi:** Implementasi: major-update-payment-dualserver-print  
**Perubahan:** Akses localStorage  
**Lines:** 1-298

```javascript
// Line 1:
+ # Major Update: Payment System, Dual Server & Printout
+ 
+ **Tanggal**: 29 Juli 2026  
+ **Project**: qorestoweb  
+ **Referensi**: webcsa-v2 (trenly) sebagai basis implementasi
+ 
+ ---
+ 
+ ## 1. Ringkasan Perubahan
+ 
+ Update ini menambahkan tiga fitur besar ke modul BQO (restoran):
+ 
+ | Fitur | Deskripsi |
+ |---|---|
+ | **Payment System** | Dialog pilihan bayar di kasir atau mandiri (Tunai / Xendit) |
+ | **Dual Server** | Fallback otomatis ke server lokal jika server utama mati |
+ | **Printout Struk** | Cetak struk thermal 80mm dengan variasi per kondisi server |
+ | **Build Otomatis** | Script build untuk server utama dan server cadangan |
+ 
+ ---
+ 
+ ## 2. Alur Baru Konsumen
+ 
+ ```
  // ... (truncated)
+ | Build tool | Vite | CRA (react-scripts) |
+ | Config runtime | `vite-plugin-static-copy` copy app.cfg | `build-deploy.cjs` copy app.cfg |
+ | Payment module | `bjual_payment.jsx` + `BJUAL_X` | `bqo_payment.js` + `BQO_X` |
+ | Save ke lokal | `bjual_api.addToLocal()` | `bqo_api.addToLocal()` |
+ | Template struk | `xrprnjua.js` (external, runtime) | `BQOReceipt.jsx` (inline JSX) |
+ | Print library | `react-to-print` | Native popup window |
+ | Dialog pilih metode | `handleGoToPaymentPage()` + SweetAlert2 | Dialog MUI inline di `bqo_checkout.js` |
+ | Pilihan bayar kasir | ❌ (kasir yang input) | ✅ Konsumen bisa pilih bayar di kasir |
+ 
+ ---
+ 
+ ## 12. Yang Belum Diimplementasikan (Roadmap)
+ 
+ | Item | Keterangan |
+ |---|---|
+ | `BBANK_X` data di backend | Backend perlu menyediakan data channel bayar untuk endpoint `bbank_x` |
+ | Auto-sync lokal → utama | Setelah server utama hidup kembali, transaksi lokal perlu di-sync manual atau otomatis |
+ | Credential fallback yang aman | `auth_local_user` / `auth_local_pass` di localStorage adalah solusi sementara — perlu shared session store |
+ | Aktivasi Xendit | Set `REACT_APP_USE_XENDIT_PAYMENT=Y` di `.env-cmdrc` dan pastikan PHP gateway server sudah berjalan |
+ | Backend `bqo_x` terima `paymentInfo` | Backend perlu handle field `paymentInfo: { cbnkid, namount }` dalam action `add` |
+ 
+ ---
+ 
+ *Dokumentasi ini dibuat berdasarkan implementasi pada 29 Juli 2026.*  
+ *Referensi: `webcsa-v2/src/scripts/modules/BJUAL/` (trenly payment system)*
```

---

#### 7. docs/panduan-build-dan-development.md [20260729_131609]
**Fungsi:** Implementasi: panduan-build-dan-development  
**Perubahan:** Pembaruan kode  
**Lines:** 1-391

```javascript
// Line 1:
+ # Panduan Build Production & Mode Development
+ 
+ **Project**: qorestoweb  
+ **Build tool**: Create React App (CRA) + `env-cmd` + `build-deploy.cjs`
+ 
+ ---
+ 
+ ## Daftar Isi
+ 
+ 1. [Prasyarat](#1-prasyarat)
+ 2. [Struktur Environment](#2-struktur-environment)
+ 3. [Mode Development](#3-mode-development)
+ 4. [Build Production — Server Utama](#4-build-production--server-utama)
+ 5. [Build Production — Server Cadangan](#5-build-production--server-cadangan)
+ 6. [Build Keduanya Sekaligus](#6-build-keduanya-sekaligus)
+ 7. [Deploy ke Server](#7-deploy-ke-server)
+ 8. [Edit Config Tanpa Rebuild](#8-edit-config-tanpa-rebuild-appcfg)
+ 9. [Referensi Semua Scripts](#9-referensi-semua-scripts)
+ 10. [Troubleshooting](#10-troubleshooting)
+ 
+ ---
+ 
+ ## 1. Prasyarat
+ 
  // ... (truncated)
+ 
+ ### `app.cfg` tidak terbaca di browser
+ 
+ Pastikan file ada di root folder build (bukan di subfolder):
+ ```
+ build/app.cfg   ✅
+ build/static/app.cfg  ❌
+ ```
+ 
+ Jika pakai `yarn build:primary` atau `yarn build:cadangan`, ini ditangani otomatis.
+ 
+ ### Setelah edit `app.cfg` di server, perubahan tidak efektif
+ 
+ Hard refresh browser: **Ctrl + Shift + R** (Windows) atau **Cmd + Shift + R** (Mac).  
+ Config di-cache di `sessionStorage` — tab baru atau hard refresh akan membaca ulang dari server.
+ 
+ ### Struk tidak tercetak (popup diblokir)
+ 
+ Browser memblokir popup. Izinkan popup untuk domain aplikasi:
+ - Chrome: klik ikon 🔒 di address bar → **Izinkan pop-up**
+ - Atau buka `chrome://settings/content/popups` dan tambahkan pengecualian
+ 
+ ---
+ 
+ *Dokumen ini berlaku untuk qorestoweb versi setelah update 29 Juli 2026.*
```

---

#### 8. docs/changelog/daily/codeChange-20260729.md [20260729_112046]
**Fungsi:** Implementasi: codeChange-20260729  
**Perubahan:** Pembaruan kode  
**Lines:** 5-63, 93, 95-96, 98-104, 109, 111-113

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260729.md [20260729_104543]
+ **Fungsi:** Implementasi: codeChange-20260729  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 1-46
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 29 Juli 2026
+ + 
+ + ### 🔌 API
+ + 
+ + #### 1. src/scripts/routes/ApiRoute.js [20260729_104543]
+ + **Fungsi:** Route: ApiRoute  
+ + **Perubahan:** Pembaruan kode  
+ + **Lines:** 4-11
+ + 
+ + ```javascript
+ + // Line 1:
+ + -   LOGIN_X: `${Config.BASE_URL}/csa/pulauplastik/login_x`,
+ + -   BCUST_X: `${Config.BASE_URL}/csa/pulauplastik/bcust_x`,
  // ... (truncated)
+ ```
+ 
+ ---
+ 
// Line 90:
- ### ⚙️ Others
+ ### ⚙️ Config
- #### 1. env-cmdrc [20260729_104543]
- **Fungsi:** Implementasi: env-cmdrc  
+ #### 1. .env-cmdrc [20260729_104543]
+ **Fungsi:** Implementasi: .env-cmdrc  
+ **Lines:** 19
+ 
+ ```javascript
+ // Line 16:
+ -         "REACT_APP_API_ENDPOINT": "https://csacomputer.ddns.net/api",
+ +          "REACT_APP_API_ENDPOINT": "http://192.168.100.13/api",
+ ```
+ - **📖 Documentation:** 1 item
- - **⚙️ Others:** 1 item
- - **Total Files Modified:** 2
- - **Main Focus:** 🔌 API
+ - **⚙️ Config:** 1 item
+ - **Total Files Modified:** 3
+ - **Main Focus:** 📖 Documentation
```

---

#### 9. docs/changelog/daily/codeChange-20260729.md [20260729_104543]
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

#### 10. docs/major-update-payment-dualserver-print.md [20260729_141925]
**Fungsi:** Implementasi: major-update-payment-dualserver-print  
**Perubahan:** Pembaruan kode  
**Lines:** 106-109, 115, 117-125, 242, 245-260, 265-268, 271-279, 283, 285-286, 316

```javascript
// Line 103:
- | `.env-cmdrc` | Tambah 6 env vars baru |
- | `package.json` | Tambah 3 script build baru |
+ | `env/qorestoweb/.env` | Tambah shared env vars (xendit, bank code) |
+ | `env/qorestoweb/.env.prod` | Env production primary dengan `BUILD_PATH` dan `PUBLIC_URL` |
+ | `env/qorestoweb/.env.prod.cadangan` | Env production cadangan dengan `BUILD_PATH` dan `PUBLIC_URL` berbeda |
+ | `package.json` | Script build diganti ke pola trenly (`prod:qorestoweb`, `prod:qorestoweb-cadangan`, dll) |
- Ditambahkan ke `.env-cmdrc`:
+ Ditambahkan ke `env/qorestoweb/.env` (shared) dan masing-masing file env:
- | Key | Nilai Default | Keterangan |
- |---|---|---|
- | `REACT_APP_API_LOCAL_ENDPOINT` | `http://192.168.100.85/api` | URL server lokal (fallback) |
- | `REACT_APP_PAYMENT_API_ENDPOINT` | `http://192.168.100.13/xendit-csa/endpoints` | PHP Xendit gateway utama |
- | `REACT_APP_PAYMENT_API_LOCAL_ENDPOINT` | `http://192.168.100.85/xendit-csa/endpoints` | PHP Xendit gateway lokal |
- | `REACT_APP_USE_XENDIT_PAYMENT` | `N` | `Y` untuk aktifkan pilihan Xendit di dialog |
- | `REACT_APP_XENDIT_MODE` | `invoice` | `invoice` atau `payment-request` |
- | `REACT_APP_CASH_BANK_CODE` | `TUNAI` | Kode bank untuk pembayaran tunai |
- | `REACT_APP_XENDIT_BANK_CODE` | `XENDIT` | Kode bank untuk pembayaran Xendit |
+ | Key | File | Nilai Default | Keterangan |
+ |---|---|---|---|
+ | `REACT_APP_API_LOCAL_ENDPOINT` | `.env.prod` / `.env.prod.cadangan` | `http://192.168.100.85/api` | URL server lokal (fallback) |
+ | `REACT_APP_PAYMENT_API_ENDPOINT` | `.env.prod` / `.env.prod.cadangan` | `http://192.168.100.13/xendit-csa/endpoints` | PHP Xendit gateway utama |
+ | `REACT_APP_PAYMENT_API_LOCAL_ENDPOINT` | `.env.prod` / `.env.prod.cadangan` | `http://192.168.100.85/xendit-csa/endpoints` | PHP Xendit gateway lokal |
+ | `REACT_APP_USE_XENDIT_PAYMENT` | `.env` (shared) | `N` | `Y` untuk aktifkan pilihan Xendit di dialog |
+ | `REACT_APP_XENDIT_MODE` | `.env` (shared) | `invoice` | `invoice` atau `payment-request` |
  // ... (truncated)
- 2. Jalankan CRA build dengan env yang sesuai:
-    - `primary` → env `production`
-    - `cadangan` → env `staging`
- 3. Copy `app.cfg` yang sesuai ke `build/app.cfg`:
+ 1. Baca `BUILD_PATH` dan `PUBLIC_URL` dari env (sudah di-inject `env-cmd`)
+ 2. Hapus folder target lama
+ 3. Jalankan CRA build — CRA v5 otomatis pakai `BUILD_PATH` dari env
+ 4. Copy `app.cfg` yang sesuai ke dalam folder hasil build:
- 4. Tampilkan ringkasan isi `app.cfg` yang diterapkan
+ 5. Tampilkan ringkasan isi `app.cfg` yang diterapkan
+ 
+ ### Output folder:
+ 
+ ```
+ build/prod/
+ ├── qorestoweb/        ← URL: /qorestoweb/   (PRIMARY)
+ └── qorestoweb-cad/    ← URL: /qorestoweb-cad/ (CADANGAN)
+ ```
- | Setting | Primary (production) | Cadangan (staging) |
+ | Setting | Primary (`.env.prod`) | Cadangan (`.env.prod.cadangan`) |
+ | `PUBLIC_URL` | `/qorestoweb/` | `/qorestoweb-cad/` |
+ | `BUILD_PATH` | `build/prod/qorestoweb` | `build/prod/qorestoweb-cad` |
// Line 313:
- | Aktivasi Xendit | Set `REACT_APP_USE_XENDIT_PAYMENT=Y` di `.env-cmdrc` dan pastikan PHP gateway server sudah berjalan |
+ | Aktivasi Xendit | Set `REACT_APP_USE_XENDIT_PAYMENT=Y` di `env/qorestoweb/.env` dan pastikan PHP gateway server sudah berjalan |
```

---

#### 11. docs/panduan-build-dan-development.md [20260729_141925]
**Fungsi:** Implementasi: panduan-build-dan-development  
**Perubahan:** Pembaruan kode  
**Lines:** 42, 45-50, 57-60, 71, 74, 81, 83-85, 91, 99, 109, 114-115, 119-120, 128, 143, 145-148, 152, 154, 158, 169, 174-175, 178-180, 194, 209, 212, 217-219, 226, 228, 230, 232, 244, 246, 248, 255, 264-268, 275-277, 324-326, 328-331, 333-336, 354-355, 370-371, 374

```javascript
// Line 39:
- File konfigurasi: `.env-cmdrc` di root project.
+ File konfigurasi tersimpan di folder `env/qorestoweb/` (pola tiruan webcsa-v2/trenly).
- .env-cmdrc
- ├── development   → dev server lokal, API ke 192.168.100.13
- ├── qa            → testing lokal, API ke localhost:3002
- ├── staging       → build SERVER CADANGAN (.85 sebagai utama)
- └── production    → build SERVER UTAMA (.13 sebagai utama)
+ env/qorestoweb/
+ ├── .env                  → shared config (xendit, bank code, dll)
+ ├── .env.dev              → dev server lokal, API ke 192.168.100.13
+ ├── .env.qa               → testing lokal, API ke localhost:3002
+ ├── .env.prod             → build SERVER UTAMA (.13 sebagai utama)
+ └── .env.prod.cadangan    → build SERVER CADANGAN (.85 sebagai utama)
- | `development` | 192.168.100.13 | 192.168.100.85 | 192.168.100.13 |
- | `staging` (cadangan) | **192.168.100.85** | 192.168.100.13 | **192.168.100.85** |
- | `production` (utama) | **192.168.100.13** | 192.168.100.85 | **192.168.100.13** |
+ | `.env.dev` | 192.168.100.13 | 192.168.100.85 | 192.168.100.13 |
+ | `.env.qa` | localhost:3002 | — | — |
+ | `.env.prod` (utama) | **192.168.100.13** | 192.168.100.85 | **192.168.100.13** |
+ | `.env.prod.cadangan` | **192.168.100.85** | 192.168.100.13 | **192.168.100.85** |
// Line 68:
- yarn start:dev
+ yarn dev:qorestoweb
- Ini menjalankan dev server CRA dengan env `development`:
  // ... (truncated)
- yarn build:staging      # CRA build env staging (TANPA auto-copy app.cfg)
- 
- # ── Utilities ─────────────────────────────────────────────────────────────
- yarn changelog          # Generate changelog harian
- yarn ship               # Commit + push ke Git
- yarn new-package        # Hapus node_modules + yarn.lock, install ulang
+ # ── Utilities ─────────────────────────────────────────────────────────────────
+ yarn changelog                  # Generate changelog harian
+ yarn ship                       # Commit + push ke Git
+ yarn new-package                # Hapus node_modules + yarn.lock, install ulang
- > **Selalu gunakan `build:primary` atau `build:cadangan`** untuk build production.  
- > `build:prod` dan `build:staging` tidak meng-copy `app.cfg` yang sesuai secara otomatis.
- 
// Line 351:
- - `.env-cmdrc` ada di root project
- - Menjalankan lewat `build:primary` atau `build:cadangan`, bukan `yarn build` langsung
+ - File `env/qorestoweb/.env.prod` atau `.env.prod.cadangan` ada
+ - Menjalankan lewat `prod:qorestoweb` atau `prod:qorestoweb-cadangan`, bukan `yarn build` langsung
// Line 367:
- build/app.cfg   ✅
- build/static/app.cfg  ❌
+ build/prod/qorestoweb/app.cfg   ✅
+ build/prod/qorestoweb/static/app.cfg  ❌
- Jika pakai `yarn build:primary` atau `yarn build:cadangan`, ini ditangani otomatis.
+ Jika pakai `prod:qorestoweb` atau `prod:qorestoweb-cadangan`, ini ditangani otomatis.
```

---

### 🔌 API

#### 1. src/scripts/modules/BBANK/controllers/bbank_api.js [20260729_131609]
**Fungsi:** Modul: bbank_api  
**Perubahan:** Import: Config; Import: ApiRoute; Tambah error handling; Tambah HTTP request  
**Lines:** 1-24

```javascript
// Line 1:
+ import Config from '../../../Config';
+ import ApiRoute from '../../../routes/ApiRoute';
+ 
+ class bbank_api {
+   static async getList(data) {
+     try {
+       const res = await fetch(ApiRoute.BBANK_X, {
+         method: 'POST',
+         headers: {
+           'content-type': 'application/json',
+           secretkey: Config.SESSION_KEY(),
+           sessionid: Config.SESSION_ID(),
+         },
+         body: JSON.stringify({ action: 'getlist', ...data }, null, 2),
+       });
+       const resJson = await res.json();
+       return resJson;
+     } catch (error) {
+       return error;
+     }
+   }
+ }
+ 
+ export default bbank_api;
```

---

#### 2. src/scripts/modules/BQO/controllers/bqo_api.js [20260729_131609]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Tambah fungsi: LOCAL_BASE_URL; Akses localStorage; Tambah HTTP request; Tambah error handling  
**Lines:** 4-6, 18, 34-113

```javascript
// Line 1:
+ // URL server lokal sebagai fallback. Kosong = fitur lokal tidak aktif.
+ const LOCAL_BASE_URL = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();
+ 
// Line 15:
+         signal: AbortSignal.timeout(15000),
// Line 31:
+ 
+   /**
+    * addToLocal — kirim transaksi ke server lokal sebagai fallback.
+    * Dipanggil saat server utama tidak bisa dijangkau.
+    *
+    * Mekanisme: auto-login ke server lokal dengan credential dari localStorage,
+    * kirim transaksi, lalu auto-logout.
+    */
+   static async addToLocal(data) {
+     if (!LOCAL_BASE_URL) {
+       throw new Error('Server lokal tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
+     }
+ 
+     const localUser = window.localStorage.getItem('auth_local_user');
+     const localPass = window.localStorage.getItem('auth_local_pass');
+ 
+     if (!localUser || !localPass) {
+       throw new Error('Credential fallback tidak tersedia. Silakan login ulang.');
  // ... (truncated)
+     });
+ 
+     // Logout dari server lokal
+     try {
+       await fetch(`${LOCAL_BASE_URL}/csa/resto/login_x`, {
+         method: 'POST',
+         headers: {
+           'content-type': 'application/json',
+           'x-user': localUser,
+           secretkey: localSessionKey,
+           sessionid: localSessionID,
+         },
+         body: JSON.stringify({ action: 'logout' }),
+         signal: AbortSignal.timeout(5000),
+       });
+     } catch (_) { /* silent */ }
+ 
+     // Bersihkan safety net
+     window.sessionStorage.removeItem('local_stale_secretkey');
+     window.sessionStorage.removeItem('local_stale_sessionid');
+     window.sessionStorage.removeItem('local_stale_userid');
+ 
+     const json = await res.json();
+     return { ...json, source: 'local' };
+   }
```

---

#### 3. src/scripts/routes/ApiRoute.js [20260729_131609]
**Fungsi:** Route: ApiRoute  
**Perubahan:** Pembaruan kode  
**Lines:** 12

```javascript
// Line 9:
+   BBANK_X: `${Config.BASE_URL}/csa/resto/bbank_x`,
```

---

#### 4. src/scripts/utils/payment-api.js [20260729_131609]
**Fungsi:** Utility: payment-api  
**Perubahan:** Tambah fungsi: PRIMARY_BASE_URL; Tambah fungsi: LOCAL_BASE_URL; Tambah HTTP request; Tambah fungsi: fetchPaymentAPI; Tambah fungsi: tryFetch; Tambah error handling; Tambah fungsi: getPaymentAPIUrl  
**Lines:** 1-41

```javascript
// Line 1:
+ /**
+  * payment-api.js
+  *
+  * Helper fetch ke Payment API (Xendit PHP gateway) dengan fallback
+  * otomatis ke server lokal jika server utama tidak bisa dijangkau.
+  *
+  * Server utama : REACT_APP_PAYMENT_API_ENDPOINT
+  * Server lokal : REACT_APP_PAYMENT_API_LOCAL_ENDPOINT
+  */
+ 
+ export const PRIMARY_BASE_URL = (process.env.REACT_APP_PAYMENT_API_ENDPOINT || '').trim();
+ export const LOCAL_BASE_URL   = (process.env.REACT_APP_PAYMENT_API_LOCAL_ENDPOINT || '').trim();
+ 
+ const TIMEOUT_MS = 10000; // 10 detik
+ 
+ /**
+  * Fetch ke payment API dengan auto-fallback ke server lokal.
+  * Signature sama dengan fetch() biasa.
+  */
+ export async function fetchPaymentAPI(path, options = {}) {
+   const tryFetch = (baseUrl) =>
+     fetch(`${baseUrl}${path}`, {
+       ...options,
+       signal: AbortSignal.timeout(TIMEOUT_MS),
+     });
+ 
+   try {
+     return await tryFetch(PRIMARY_BASE_URL);
+   } catch (_) {
+     if (!LOCAL_BASE_URL) throw new Error('Server payment tidak dapat dijangkau.');
+     return await tryFetch(LOCAL_BASE_URL);
+   }
+ }
+ 
+ /**
+  * Buat URL SSE ke payment API (primary).
+  * Jika SSE gagal, polling akan otomatis aktif sebagai fallback.
+  */
+ export function getPaymentAPIUrl(path) {
+   return `${PRIMARY_BASE_URL}${path}`;
+ }
```

---

#### 5. src/scripts/routes/ApiRoute.js [20260729_104543]
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

#### 1. build-deploy.cjs [20260729_133927]
**Fungsi:** Implementasi: build-deploy  
**Perubahan:** Hapus debug log  
**Lines:** 92-104, 115

```javascript
// Line 89:
+ // ── Step 2b: Pindahkan output CRA ke folder tujuan (khusus cadangan) ─────────
+ // CRA selalu output ke ./build/, jadi perlu di-rename ke BUILD_DIR jika cadangan.
+ if (isCadangan) {
+   const CRA_DEFAULT_DIR = path.join(ROOT, 'build');
+   console.log('');
+   console.log(`📦  Memindahkan ./build/ → ./build-cadangan/...`);
+   if (fs.existsSync(BUILD_DIR)) {
+     fs.rmSync(BUILD_DIR, { recursive: true, force: true });
+   }
+   fs.renameSync(CRA_DEFAULT_DIR, BUILD_DIR);
+   console.log('    ✅  Selesai dipindahkan.');
+ }
+ 
// Line 112:
- console.log(`    ✅  ${path.basename(APP_CFG_SRC)} → build/app.cfg`);
+ console.log(`    ✅  ${path.basename(APP_CFG_SRC)} → ${path.relative(ROOT, APP_CFG_DEST)}`);
```

---

#### 2. .env-cmdrc [20260729_133715]
**Fungsi:** Implementasi: .env-cmdrc  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 36

```javascript
// Line 33:
-         "PUBLIC_URL": "/qorestoweb/"
+         "PUBLIC_URL": "/qorestoweb-cad/"
```

---

#### 3. build-deploy.cjs [20260729_133715]
**Fungsi:** Implementasi: build-deploy  
**Perubahan:** Hapus debug log  
**Lines:** 36, 118

```javascript
// Line 33:
- const BUILD_DIR  = path.join(ROOT, 'build');
+ const BUILD_DIR  = path.join(ROOT, isCadangan ? 'build-cadangan' : 'build');
// Line 115:
- console.log(`║  📁  Output: ./build/`.padEnd(51) + '║');
+ console.log(`║  📁  Output: ./${isCadangan ? 'build-cadangan' : 'build'}/`.padEnd(51) + '║');
```

---

#### 4. .env-cmdrc [20260729_131609]
**Fungsi:** Implementasi: .env-cmdrc  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 5-12, 17-23, 29-35, 40-47, 51

```javascript
// Line 2:
-         "PUBLIC_URL": "/qorestoweb/"       
+         "REACT_APP_API_LOCAL_ENDPOINT": "http://192.168.100.85/api",
+         "REACT_APP_PAYMENT_API_ENDPOINT": "http://192.168.100.13/xendit-csa/endpoints",
+         "REACT_APP_PAYMENT_API_LOCAL_ENDPOINT": "http://192.168.100.85/xendit-csa/endpoints",
+         "REACT_APP_USE_XENDIT_PAYMENT": "N",
+         "REACT_APP_XENDIT_MODE": "invoice",
+         "REACT_APP_CASH_BANK_CODE": "TUNAI",
+         "REACT_APP_XENDIT_BANK_CODE": "XENDIT",
+         "PUBLIC_URL": "/qorestoweb/"
+         "REACT_APP_API_LOCAL_ENDPOINT": "",
+         "REACT_APP_PAYMENT_API_ENDPOINT": "",
+         "REACT_APP_PAYMENT_API_LOCAL_ENDPOINT": "",
+         "REACT_APP_USE_XENDIT_PAYMENT": "N",
+         "REACT_APP_XENDIT_MODE": "invoice",
+         "REACT_APP_CASH_BANK_CODE": "TUNAI",
+         "REACT_APP_XENDIT_BANK_CODE": "XENDIT",
+         "REACT_APP_API_LOCAL_ENDPOINT": "http://192.168.100.13/api",
+         "REACT_APP_PAYMENT_API_ENDPOINT": "http://192.168.100.85/xendit-csa/endpoints",
+         "REACT_APP_PAYMENT_API_LOCAL_ENDPOINT": "http://192.168.100.13/xendit-csa/endpoints",
+         "REACT_APP_USE_XENDIT_PAYMENT": "N",
+         "REACT_APP_XENDIT_MODE": "invoice",
+         "REACT_APP_CASH_BANK_CODE": "TUNAI",
+         "REACT_APP_XENDIT_BANK_CODE": "XENDIT",
-          "REACT_APP_API_ENDPOINT": "http://192.168.100.13/api",
+         "REACT_APP_API_ENDPOINT": "http://192.168.100.13/api",
+         "REACT_APP_API_LOCAL_ENDPOINT": "http://192.168.100.85/api",
+         "REACT_APP_PAYMENT_API_ENDPOINT": "http://192.168.100.13/xendit-csa/endpoints",
+         "REACT_APP_PAYMENT_API_LOCAL_ENDPOINT": "http://192.168.100.85/xendit-csa/endpoints",
+         "REACT_APP_USE_XENDIT_PAYMENT": "N",
+         "REACT_APP_XENDIT_MODE": "invoice",
+         "REACT_APP_CASH_BANK_CODE": "TUNAI",
+         "REACT_APP_XENDIT_BANK_CODE": "XENDIT",
- }
+ }
```

---

#### 5. build-deploy.cjs [20260729_131609]
**Fungsi:** Implementasi: build-deploy  
**Perubahan:** Tambah error handling  
**Lines:** 1-120

```javascript
// Line 1:
+ /**
+  * build-deploy.cjs
+  *
+  * Script build otomatis untuk qorestoweb.
+  * Menggantikan fungsi vite.config.js di webcsa-v2 (trenly) untuk CRA.
+  *
+  * Usage:
+  *   node build-deploy.cjs --mode=primary    → build server utama
+  *   node build-deploy.cjs --mode=cadangan   → build server cadangan
+  *
+  * Yang dilakukan script ini:
+  *   1. Set env vars dari .env-cmdrc sesuai environment
+  *   2. Jalankan CRA build
+  *   3. Copy app.cfg.primary atau app.cfg.cadangan → build/app.cfg
+  *   4. Tampilkan ringkasan hasil build
+  */
+ 
+ const { execSync }   = require('child_process');
+ const fs             = require('fs');
+ const path           = require('path');
+ 
+ // ── Parse args ──────────────────────────────────────────────────────────────
+ const args = process.argv.slice(2);
+ const modeArg = args.find((a) => a.startsWith('--mode='));
  // ... (truncated)
+ if (!fs.existsSync(BUILD_DIR)) {
+   console.error('❌  Folder build tidak ditemukan setelah build selesai.');
+   process.exit(1);
+ }
+ 
+ fs.copyFileSync(APP_CFG_SRC, APP_CFG_DEST);
+ console.log(`    ✅  ${path.basename(APP_CFG_SRC)} → build/app.cfg`);
+ 
+ // ── Step 4: Tampilkan isi app.cfg yang di-copy ───────────────────────────────
+ try {
+   const cfgContent = JSON.parse(fs.readFileSync(APP_CFG_DEST, 'utf-8'));
+   console.log('');
+   console.log('    Isi app.cfg yang diterapkan:');
+   Object.entries(cfgContent).forEach(([k, v]) => {
+     console.log(`      ${k}: ${JSON.stringify(v)}`);
+   });
+ } catch (_) { /* skip */ }
+ 
+ // ── Selesai ──────────────────────────────────────────────────────────────────
+ console.log('');
+ console.log('╔══════════════════════════════════════════════════╗');
+ console.log(`║  ✅  BUILD ${mode.toUpperCase()} SELESAI!`.padEnd(51) + '║');
+ console.log(`║  📁  Output: ./build/`.padEnd(51) + '║');
+ console.log('╚══════════════════════════════════════════════════╝');
+ console.log('');
```

---

#### 6. package.json [20260729_131609]
**Fungsi:** Implementasi: package  
**Perubahan:** Pembaruan kode  
**Lines:** 47-51

```javascript
// Line 44:
-     "build:staging": "rm -rf build && env-cmd -e staging yarn build",
-     "build:prod": "rm -rf build && env-cmd -e production yarn build",
+     "build:staging": "rm -rf build && env-cmd -e staging react-scripts build",
+     "build:prod": "rm -rf build && env-cmd -e production react-scripts build",
+     "build:primary": "node build-deploy.cjs --mode=primary",
+     "build:cadangan": "node build-deploy.cjs --mode=cadangan",
+     "build:all": "node build-deploy.cjs --mode=primary && node build-deploy.cjs --mode=cadangan",
```

---

#### 7. .env-cmdrc [20260729_104543]
**Fungsi:** Implementasi: .env-cmdrc  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 19

```javascript
// Line 16:
-         "REACT_APP_API_ENDPOINT": "https://csacomputer.ddns.net/api",
+          "REACT_APP_API_ENDPOINT": "http://192.168.100.13/api",
```

---

#### 8. build-deploy.cjs [20260729_141925]
**Fungsi:** Implementasi: build-deploy  
**Perubahan:** Hapus debug log  
**Lines:** 5, 7-9, 12-16, 19-21, 24, 26, 36-37, 40, 42, 45, 51-54, 64, 68, 74, 76, 80, 85, 91, 103, 105, 108-109, 111, 115

```javascript
// Line 2:
-  * Menggantikan fungsi vite.config.js di webcsa-v2 (trenly) untuk CRA.
+  * Dipanggil setelah env sudah di-inject oleh env-cmd.
-  * Usage:
-  *   node build-deploy.cjs --mode=primary    → build server utama
-  *   node build-deploy.cjs --mode=cadangan   → build server cadangan
+  * Usage (via package.json):
+  *   yarn prod:qorestoweb           → build server utama   (primary)
+  *   yarn prod:qorestoweb-cadangan  → build server cadangan
-  *   1. Set env vars dari .env-cmdrc sesuai environment
-  *   2. Jalankan CRA build
-  *   3. Copy app.cfg.primary atau app.cfg.cadangan → build/app.cfg
-  *   4. Tampilkan ringkasan hasil build
+  *   1. Baca BUILD_PATH dan PUBLIC_URL dari env (sudah di-inject env-cmd)
+  *   2. Hapus folder BUILD_PATH lama
+  *   3. Jalankan CRA build (CRA v5 otomatis pakai BUILD_PATH dari env)
+  *   4. Copy app.cfg yang sesuai ke dalam folder hasil build
+  *   5. Tampilkan ringkasan
- const { execSync }   = require('child_process');
- const fs             = require('fs');
- const path           = require('path');
+ const { execSync } = require('child_process');
+ const fs           = require('fs');
+ const path         = require('path');
- const args = process.argv.slice(2);
  // ... (truncated)
-   console.log(`📦  Memindahkan ./build/ → ./build-cadangan/...`);
-   if (fs.existsSync(BUILD_DIR)) {
-     fs.rmSync(BUILD_DIR, { recursive: true, force: true });
-   }
-   fs.renameSync(CRA_DEFAULT_DIR, BUILD_DIR);
-   console.log('    ✅  Selesai dipindahkan.');
- }
- 
- // ── Step 3: Copy app.cfg yang sesuai ─────────────────────────────────────────
+ // ── Step 3: Copy app.cfg ──────────────────────────────────────────────────────
// Line 100:
- // ── Step 4: Tampilkan isi app.cfg yang di-copy ───────────────────────────────
+ // ── Step 4: Tampilkan isi app.cfg ─────────────────────────────────────────────
-   const cfgContent = JSON.parse(fs.readFileSync(APP_CFG_DEST, 'utf-8'));
+   const cfg = JSON.parse(fs.readFileSync(APP_CFG_DEST, 'utf-8'));
-   Object.entries(cfgContent).forEach(([k, v]) => {
-     console.log(`      ${k}: ${JSON.stringify(v)}`);
-   });
- } catch (_) { /* skip */ }
+   Object.entries(cfg).forEach(([k, v]) => console.log(`      ${k}: ${JSON.stringify(v)}`));
+ } catch { /* skip */ }
- // ── Selesai ──────────────────────────────────────────────────────────────────
+ // ── Selesai ───────────────────────────────────────────────────────────────────
- console.log(`║  📁  Output: ./${isCadangan ? 'build-cadangan' : 'build'}/`.padEnd(51) + '║');
+ console.log(`║  📁  Output: ./${path.relative(ROOT, BUILD_DIR)}/`.padEnd(51) + '║');
```

---

#### 9. package.json [20260729_141925]
**Fungsi:** Implementasi: package  
**Perubahan:** Tambah/ubah npm script  
**Lines:** 45-49

```javascript
// Line 42:
-     "start:dev": "env-cmd -e development yarn start",
-     "start:qa": "env-cmd -e qa yarn start",
-     "build:staging": "rm -rf build && env-cmd -e staging react-scripts build",
-     "build:prod": "rm -rf build && env-cmd -e production react-scripts build",
-     "build:primary": "node build-deploy.cjs --mode=primary",
-     "build:cadangan": "node build-deploy.cjs --mode=cadangan",
-     "build:all": "node build-deploy.cjs --mode=primary && node build-deploy.cjs --mode=cadangan",
+     "dev:qorestoweb": "env-cmd -f ./env/qorestoweb/.env -f ./env/qorestoweb/.env.dev yarn start",
+     "qa:qorestoweb": "env-cmd -f ./env/qorestoweb/.env -f ./env/qorestoweb/.env.qa yarn start",
+     "prod:qorestoweb": "env-cmd -f ./env/qorestoweb/.env -f ./env/qorestoweb/.env.prod node build-deploy.cjs --mode=primary",
+     "prod:qorestoweb-cadangan": "env-cmd -f ./env/qorestoweb/.env -f ./env/qorestoweb/.env.prod.cadangan node build-deploy.cjs --mode=cadangan",
+     "prod:qorestoweb-all": "yarn prod:qorestoweb && yarn prod:qorestoweb-cadangan",
```

---

### ⚙️ Others

#### 1. public/app.cfg [20260729_131609]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 1-9

```javascript
// Line 1:
+ {
+   "enable_fail_download": true,
+   "debug_save_fail": "",
+   "debug_local_save_fail": "",
+   "server_mode": "primary",
+   "server_label": "",
+   "xendit_payment_timeout_minutes": 5,
+   "xendit_show_simulate": false
+ }
```

---

#### 2. public/app.cfg.cadangan [20260729_131609]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 1-9

```javascript
// Line 1:
+ {
+   "enable_fail_download": true,
+   "debug_save_fail": "",
+   "debug_local_save_fail": "",
+   "server_mode": "local",
+   "server_label": "SERVER CADANGAN",
+   "xendit_payment_timeout_minutes": 5,
+   "xendit_show_simulate": false
+ }
```

---

#### 3. src/scripts/App.js [20260729_131609]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Import: react; Tambah side effect; Import: app-config  
**Lines:** 1, 11, 19-23

```javascript
// Line 1:
- import React, { useRef, lazy, Suspense } from 'react';
+ import React, { useRef, lazy, Suspense, useEffect } from 'react';
// Line 8:
+ import { loadAppConfig } from './utils/app-config';
// Line 16:
+ 
+   // Load runtime config (app.cfg) sekali saat app pertama mount
+   useEffect(() => {
+     loadAppConfig();
+   }, []);
```

---

#### 4. src/scripts/utils/app-config.js [20260729_131609]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Tambah fungsi: loadAppConfig; Tambah error handling; Tambah HTTP request; Tambah fungsi: getAppConfig; Tambah fungsi: isFeatureEnabled  
**Lines:** 1-65

```javascript
// Line 1:
+ /**
+  * app-config.js
+  *
+  * Membaca konfigurasi runtime dari file app.cfg di folder build.
+  * File ini bisa diedit langsung di server tanpa rebuild.
+  *
+  * Lokasi file: {PUBLIC_URL}/app.cfg
+  */
+ 
+ const APP_CONFIG_KEY      = 'qoAppConfig';
+ const APP_CONFIG_FILENAME = 'app.cfg';
+ const APP_CONFIG_ENDPOINT =
+   window.location.origin + (process.env.PUBLIC_URL || '/') + APP_CONFIG_FILENAME;
+ 
+ const DEFAULT_CONFIG = {
+   enable_fail_download:          false,
+   debug_save_fail:               '', // 'network_error' | 'backend_reject' | ''
+   debug_local_save_fail:         '', // 'network_error' | ''
+   server_mode:                   'primary', // 'primary' | 'local'
+   server_label:                  '',
+   xendit_payment_timeout_minutes: 5,
+   xendit_show_simulate:          false,
+ };
+ 
  // ... (truncated)
+   }
+ };
+ 
+ /**
+  * Baca config dari memory/sessionStorage (sync).
+  */
+ export const getAppConfig = () => {
+   if (_cachedConfig) return _cachedConfig;
+   try {
+     const stored = window.sessionStorage.getItem(APP_CONFIG_KEY);
+     if (stored) {
+       _cachedConfig = JSON.parse(stored);
+       return _cachedConfig;
+     }
+   } catch (_) { /* ignore */ }
+   return { ...DEFAULT_CONFIG };
+ };
+ 
+ /**
+  * Shorthand cek satu flag boolean.
+  */
+ export const isFeatureEnabled = (key) => {
+   const config = getAppConfig();
+   return config[key] === true;
+ };
```

---

#### 5. src/scripts/utils/failed-trx-download.js [20260729_131609]
**Fungsi:** Utility: failed-trx-download  
**Perubahan:** Import: react; Tambah state management; Tambah fungsi: downloadFailedTrx; Tambah error handling; Tambah fungsi: pad; Tambah fungsi: resetDownloadState  
**Lines:** 1-59

```javascript
// Line 1:
+ /**
+  * failed-trx-download.js
+  *
+  * Download payload transaksi gagal ke file JSON sebagai failsafe
+  * saat kedua server (utama + lokal) tidak bisa dijangkau.
+  */
+ 
+ import { useState } from 'react';
+ 
+ export default function useFailedTrxDownload() {
+   const [isDownloaded, setIsDownloaded] = useState(false);
+ 
+   /**
+    * Download payload sebagai file JSON.
+    * @param {object} payload    - data transaksi lengkap
+    * @param {string} errorType  - 'network_error' | 'backend_reject'
+    * @param {object} extraMeta  - info tambahan (seatNumber, orderByName, dll)
+    */
+   const downloadFailedTrx = (payload, errorType = 'unknown', extraMeta = {}) => {
+     try {
+       const now      = new Date();
+       const pad      = (n) => String(n).padStart(2, '0');
+       const dateStr  = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
+       const timeStr  = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  // ... (truncated)
+           },
+           payload,
+         },
+         null,
+         2
+       );
+ 
+       const blob = new Blob([content], { type: 'application/json' });
+       const url  = URL.createObjectURL(blob);
+       const a    = document.createElement('a');
+       a.href     = url;
+       a.download = filename;
+       a.click();
+       URL.revokeObjectURL(url);
+ 
+       setIsDownloaded(true);
+     } catch (err) {
+       console.error('Gagal download transaksi:', err);
+     }
+   };
+ 
+   const resetDownloadState = () => setIsDownloaded(false);
+ 
+   return { isDownloaded, downloadFailedTrx, resetDownloadState };
+ }
```

---

#### 6. env-cmdrc [20260729_141925]
**Fungsi:** Implementasi: env-cmdrc  
**Perubahan:** Ubah konfigurasi environment / API endpoint  

---

#### 7. env/ [20260729_141925]
**Fungsi:** Implementasi: env  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **✨ Features:** 6 items
- **📖 Documentation:** 11 items
- **🔌 API:** 5 items
- **⚙️ Config:** 9 items
- **⚙️ Others:** 7 items
- **Total Files Modified:** 38
- **Main Focus:** 📖 Documentation
