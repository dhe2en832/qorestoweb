# Code Changes Summary

## 30 Juli 2026

### ✨ Features

#### 1. src/scripts/modules/BQO/views/bqo_payment.js [20260730_095820]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Import: payment-api; Import: BQOXenditChannelView; Import: react-qr-code; Tambah state management; Tambah fungsi: handleSelectXenditChannel; Tambah fungsi: handleSimulatePayment; Tambah error handling; Tambah fungsi: ewalletRedirectUrl  
**Lines:** 30, 33-34, 74-75, 231-238, 243, 248-281, 398-401, 410-450, 454, 456-457, 459, 463-464, 467-468, 474-475, 477-480, 482-483, 485-487, 489-518, 520-540, 543-568, 570-646, 651-652, 654-656, 661-662, 664-666, 671-672, 674-677, 679-683

```javascript
// Line 11:
- import List from '@mui/material/List';
- import ListItem from '@mui/material/ListItem';
- import ListItemButton from '@mui/material/ListItemButton';
- import ListItemText from '@mui/material/ListItemText';
- import PaymentIcon from '@mui/icons-material/Payment';
// Line 27:
+ import { fetchPaymentAPI, getPaymentAPIUrl, PRIMARY_BASE_URL, LOCAL_BASE_URL } from '../../../utils/payment-api';
+ import BQOXenditChannelView from '../components/BQOXenditChannelView';
+ import QRCode from 'react-qr-code';
// Line 71:
-   const [bankList,            setBankList]            = useState([]);
-   const [bankListLoading,     setBankListLoading]     = useState(false);
+   const [isSimulating,        setIsSimulating]        = useState(false);
+   const [simulationSent,      setSimulationSent]      = useState(false);
// Line 82:
-   // ── Fetch daftar bank untuk Xendit channel ────────────────────────────────
-   useEffect(() => {
-     if (activeView !== 'xendit-channel') return;
-     let active = true;
-     const fetchBanks = async () => {
-       try {
-         setBankListLoading(true);
-         const { default: bbank_api } = await import('../../BBANK/controllers/bbank_api');
-         const res = await bbank_api.getList({
  // ... (truncated)
+           <Box py={2} textAlign="center">
+             <Alert severity="error" sx={{ mb: 2 }}>Pembayaran gagal atau kedaluwarsa.</Alert>
+             <Button sx={{ mt: 2 }} onClick={() => { resetXenditPaymentInfo(); setSimulationSent(false); setActiveView('xendit-channel'); }}>
+ 
+         {/* Timeout */}
-           <Box py={2}>
-             <Alert severity="warning">Waktu pembayaran habis.</Alert>
-             <Button sx={{ mt: 2 }} onClick={() => { resetXenditPaymentInfo(); setActiveView('xendit-channel'); }}>
+           <Box py={2} textAlign="center">
+             <Alert severity="warning" sx={{ mb: 2 }}>Waktu pembayaran habis.</Alert>
+             <Button onClick={() => { resetXenditPaymentInfo(); setActiveView('xendit-channel'); }}>
+ 
+         {/* Menyimpan transaksi setelah Xendit konfirmasi */}
-           <Box py={2}><CircularProgress /><Typography mt={1} variant="body2">Menyimpan transaksi...</Typography></Box>
+           <Box textAlign="center" py={2}>
+             <CircularProgress size={24} />
+             <Typography mt={1} variant="body2">Menyimpan transaksi...</Typography>
+           </Box>
-         <Box mt={1}>
-           <Button size="small" onClick={() => { resetXenditPaymentInfo(); setActiveView('choose'); }}>← Kembali</Button>
+ 
+         <Box mt={2}>
+           <Button size="small" onClick={() => { resetXenditPaymentInfo(); setActiveView('choose'); }}>
+             ← Kembali
+           </Button>
```

---

#### 2. src/scripts/modules/BQO/reports/BQOOrderSlip.jsx [20260730_090041]
**Fungsi:** Modul: BQOOrderSlip  
**Perubahan:** Import: react; Import: formatter; Tambah fungsi: pad; Ubah render/return JSX  
**Lines:** 1-196

```javascript
// Line 1:
+ import React, { forwardRef } from 'react';
+ import { toCurrencyIDR } from '../../../utils/formatter';
+ 
+ /**
+  * BQOOrderSlip — Tanda Terima Pesanan (bukan struk pembayaran).
+  * Dicetak saat konsumen memilih "Bayar di Kasir".
+  *
+  * Fungsi: bukti pesanan sudah masuk ke dapur / kasir.
+  * Status pembayaran: BELUM DIBAYAR — konsumen membawa ini ke kasir.
+  *
+  * Props:
+  *   datas.orderInfo   - { seatNumber, orderByName, phoneNumber }
+  *   datas.cart        - array item pesanan { item, qty, note? }
+  *   datas.subtotal    - number (sebelum pajak)
+  *   datas.taxAmount   - number
+  *   datas.total       - number (grand total tagihan)
+  *   datas.nomorPesanan - string (nomor pesanan dari backend)
+  */
+ const BQOOrderSlip = forwardRef(function BQOOrderSlip({ datas = {} }, ref) {
+   const {
+     orderInfo   = {},
+     cart        = [],
+     subtotal    = 0,
+     taxAmount   = 0,
  // ... (truncated)
+     color: '#555',
+     fontStyle: 'italic',
+   },
+   statusBox: {
+     border: '2px solid #000',
+     textAlign: 'center',
+     fontWeight: 'bold',
+     fontSize: '11px',
+     padding: '3px',
+     margin: '6px 0',
+     letterSpacing: '2px',
+   },
+   footerNote: {
+     fontSize: '10px',
+     fontWeight: 'bold',
+     marginBottom: '2px',
+   },
+   footerSmall: {
+     fontSize: '9px',
+     color: '#777',
+     marginTop: '2px',
+   },
+ };
+ 
+ export default BQOOrderSlip;
```

---

#### 3. src/scripts/modules/BQO/views/bqo_checkout.js [20260730_090041]
**Fungsi:** Halaman checkout & submit order  
**Perubahan:** Import: BQOOrderSlip  
**Lines:** 33, 672, 675, 678-683, 764

```javascript
// Line 30:
- import BQOReceipt from '../reports/BQOReceipt';
+ import BQOOrderSlip from '../reports/BQOOrderSlip';
// Line 669:
-       {/* Hidden receipt component untuk kasir — rendered tapi tidak terlihat */}
+       {/* Hidden order slip component untuk kasir — rendered tapi tidak terlihat */}
-           <BQOReceipt
+           <BQOOrderSlip
-               cart:          kasirResult.cartItems,
-               orderInfo:     info,
-               subtotal:      kasirResult.subtotal,
-               taxAmount:     kasirResult.taxAmount,
-               total:         kasirResult.total,
-               paymentMethod: 'Bayar di Kasir',
-               nomorBon:      kasirResult.nomorBon,
-               isLocalServer: false,
-               showArchiveCopy: false,
-               isUnrecorded:  false,
+               orderInfo:    info,
+               cart:         kasirResult.cartItems,
+               subtotal:     kasirResult.subtotal,
+               taxAmount:    kasirResult.taxAmount,
+               total:        kasirResult.total,
+               nomorPesanan: kasirResult.nomorBon,
// Line 761:
-             {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Struk'}
+             {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Tanda Pesanan'}
```

---

#### 4. src/scripts/modules/BQO/views/bqo_payment.js [20260730_090041]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Tambah fungsi: CASH_BANK_CODE; Tambah fungsi: XENDIT_BANK_CODE  
**Lines:** 39-41

```javascript
// Line 36:
- const USE_XENDIT     = process.env.REACT_APP_USE_XENDIT_PAYMENT === 'Y';
- const CASH_BANK_CODE = (process.env.REACT_APP_CASH_BANK_CODE  || 'TUNAI').trim();
- const XENDIT_BANK_CODE = (process.env.REACT_APP_XENDIT_BANK_CODE || 'XENDIT').trim();
+ const USE_XENDIT      = process.env.REACT_APP_USE_XENDIT_PAYMENT === 'Y';
+ const CASH_BANK_CODE  = (process.env.REACT_APP_CASH_BANK_CODE   || 'T000').trim();
+ const XENDIT_BANK_CODE = (process.env.REACT_APP_XENDIT_BANK_CODE || 'X000').trim();
```

---

#### 5. src/scripts/modules/BQO/views/bqo_payment.js [20260730_104803]
**Fungsi:** Modul: bqo_payment  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Tambah error handling; Tambah fungsi: buildCurrentPayload; Tambah fungsi: handleTunaiRetry; Tambah fungsi: handleTunaiSaveToLocal; Tambah fungsi: handleXenditRetry; Tambah fungsi: handleXenditSaveToLocal; Tambah fungsi: handleSaveToLocal  
**Lines:** 1, 46-56, 60-61, 150-154, 161-183, 187-191, 199-220, 223, 231-232, 234-265, 267-269, 275-278, 346-356, 452-453, 455-483, 489, 571-572, 574-601, 748

```javascript
// Line 1:
- import React, { useState, useEffect, useRef, useCallback } from 'react';
- import { useNavigate } from 'react-router-dom';
+ import React, { useState, useEffect, useRef, useCallback } from 'react';import { useNavigate } from 'react-router-dom';
// Line 43:
-   const _appCfg   = getAppConfig();
-   const isLocalServer      = _appCfg.server_mode === 'local';
+ 
+   // ── Load app.cfg — force reload saat komponen mount ─────────────────────
+   const [appCfg, setAppCfg] = useState(() => getAppConfig());
+   useEffect(() => {
+     // Selalu load ulang saat komponen payment mount — pastikan config terbaru
+     import('../../../utils/app-config').then(({ loadAppConfig }) => {
+       loadAppConfig().then((cfg) => setAppCfg({ ...cfg }));
+     });
+   }, []);
+ 
+   const isLocalServer      = appCfg.server_mode === 'local';
+   const showSimulate = appCfg.xendit_show_simulate === true
+     || process.env.REACT_APP_STATUS === 'development'; // selalu tampil di dev mode
// Line 147:
-         const errMsg = result.onfail?.cerror || 'Backend menolak transaksi.';
-         if (isXenditMode) setXenditSaveError({ type: 'backend_reject', message: errMsg });
-         else              setTunaiSaveError({ type: 'backend_reject', message: errMsg });
+         const errMsg    = result.onfail?.cerror || 'Backend menolak transaksi.';
  // ... (truncated)
+                     `YA, COBA LAGI KE ${labelPusat.toUpperCase()}`,
+                     handleXenditRetry,
+                     `TIDAK, SIMPAN KE ${labelLokal.toUpperCase()}`,
+                     handleXenditSaveToLocal,
+                   )}
+                   disabled={isValidating}
+                 >
+                   {isValidating ? <CircularProgress size={14} /> : `⟳ Coba Lagi ke ${labelPusat}`}
+                 </Button>
+               )}
+               {xenditSaveError.type === 'network_error' && (
+                 <Button size="small" variant="outlined" color="secondary"
+                   onClick={handleXenditSaveToLocal} disabled={isValidating}>
+                   Simpan ke {labelLokal}
+                 </Button>
+               )}
+               {enableFailDownload && ['network_error', 'local_unreachable'].includes(xenditSaveError.type) && (
+                 <Button size="small" variant="outlined" color="error"
+                   onClick={() => handleDownloadAndComplete(xenditSaveError.type)}>
+                   ⬇ Unduh Data
+                 </Button>
+               )}
// Line 745:
-             {getAppConfig().xendit_show_simulate === true && (
+             {showSimulate && (
```

---

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260730.md [20260730_095820]
**Fungsi:** Implementasi: codeChange-20260730  
**Perubahan:** Tambah state management; Tambah side effect; Tambah error handling  
**Lines:** 7-68, 105, 122-249, 256, 259-285, 289, 311, 331, 351, 369-473, 475-480

```javascript
// Line 4:
- #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260730_090039]
+ #### 1. src/scripts/modules/BQO/reports/BQOOrderSlip.jsx [20260730_090041]
+ **Fungsi:** Modul: BQOOrderSlip  
+ **Perubahan:** Import: react; Import: formatter; Tambah fungsi: pad; Ubah render/return JSX  
+ **Lines:** 1-196
+ 
+ ```javascript
+ // Line 1:
+ + import React, { forwardRef } from 'react';
+ + import { toCurrencyIDR } from '../../../utils/formatter';
+ + 
+ + /**
+ +  * BQOOrderSlip — Tanda Terima Pesanan (bukan struk pembayaran).
+ +  * Dicetak saat konsumen memilih "Bayar di Kasir".
+ +  *
+ +  * Fungsi: bukti pesanan sudah masuk ke dapur / kasir.
+ +  * Status pembayaran: BELUM DIBAYAR — konsumen membawa ini ke kasir.
+ +  *
+ +  * Props:
+ +  *   datas.orderInfo   - { seatNumber, orderByName, phoneNumber }
+ +  *   datas.cart        - array item pesanan { item, qty, note? }
+ +  *   datas.subtotal    - number (sebelum pajak)
+ +  *   datas.taxAmount   - number
+ +  *   datas.total       - number (grand total tagihan)
  // ... (truncated)
+ // Line 10302:
+ + workbox-streams@^5.1.4:
+ +   version "5.1.4"
+ +   resolved "https://registry.npmjs.org/workbox-streams/-/workbox-streams-5.1.4.tgz"
+ +   integrity sha512-xU8yuF1hI/XcVhJUAfbQLa1guQUhdLMPQJkdT0kn6HP5CwiPOGiXnSFq80rAG4b1kJUChQQIGPrq439FQUNVrw==
+ +   dependencies:
+ +     workbox-core "^5.1.4"
+ +     workbox-routing "^5.1.4"
+ + 
+ // Line 10388:
+ - yaml@^1.10.0, yaml@^1.10.2, yaml@^1.7.2, yaml@^2.4.2:
+ + yaml@^1.10.0, yaml@^1.10.2, yaml@^1.7.2:
+ ```
+ 
+ ---
+ 
- - **✨ Features:** 3 items
- - **⚙️ Config:** 5 items
- - **Total Files Modified:** 8
+ - **✨ Features:** 4 items
+ - **📖 Documentation:** 1 item
+ - **🎨 UI/UX:** 1 item
+ - **⚙️ Config:** 7 items
+ - **⚙️ Others:** 2 items
+ - **Total Files Modified:** 15
```

---

#### 2. docs/changelog/daily/codeChange-20260730.md [20260730_090041]
**Fungsi:** Implementasi: codeChange-20260730  
**Perubahan:** Pembaruan kode  
**Lines:** 1-159

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 30 Juli 2026
+ 
+ ### ✨ Features
+ 
+ #### 1. src/scripts/modules/BQO/views/bqo_checkout.js [20260730_090039]
+ **Fungsi:** Halaman checkout & submit order  
+ **Perubahan:** Import: BQOOrderSlip  
+ **Lines:** 33, 672, 675, 678-683, 764
+ 
+ ```javascript
+ // Line 30:
+ - import BQOReceipt from '../reports/BQOReceipt';
+ + import BQOOrderSlip from '../reports/BQOOrderSlip';
+ // Line 669:
+ -       {/* Hidden receipt component untuk kasir — rendered tapi tidak terlihat */}
+ +       {/* Hidden order slip component untuk kasir — rendered tapi tidak terlihat */}
+ -           <BQOReceipt
+ +           <BQOOrderSlip
+ -               cart:          kasirResult.cartItems,
+ -               orderInfo:     info,
+ -               subtotal:      kasirResult.subtotal,
+ -               taxAmount:     kasirResult.taxAmount,
  // ... (truncated)
+ ---
+ 
+ #### 5. env/qorestoweb/.env.qa [20260730_090039]
+ **Fungsi:** Implementasi: .env  
+ **Perubahan:** Ubah konfigurasi environment / API endpoint  
+ **Lines:** 1-4, 12
+ 
+ ```javascript
+ // Line 1:
+ + # ============================================================
+ + # QA / Testing — API ke localhost
+ + # ============================================================
+ + 
+ // Line 9:
+ - # API
+ + # API CSA — lokal untuk testing
+ ```
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **✨ Features:** 3 items
+ - **⚙️ Config:** 5 items
+ - **Total Files Modified:** 8
+ - **Main Focus:** ⚙️ Config
```

---

### 🎨 UI/UX

#### 1. src/scripts/modules/BQO/components/BQOXenditChannelView.jsx [20260730_095820]
**Fungsi:** Komponen UI: BQOXenditChannelView  
**Perubahan:** Import: react; Tambah state management; Tambah side effect; Import: Box; Import: Typography; Import: List; Import: ListItem; Import: ListItemButton; Import: ListItemText; Import: CircularProgress; Import: Chip; Import: Alert; Import: Divider; Tambah fungsi: PAYMENT_API; Tambah fungsi: groupChannels; Tambah HTTP request; Tambah error handling; Ubah render/return JSX  
**Lines:** 1-231

```javascript
// Line 1:
+ import React, { useEffect, useState } from 'react';
+ import Box from '@mui/material/Box';
+ import Typography from '@mui/material/Typography';
+ import List from '@mui/material/List';
+ import ListItem from '@mui/material/ListItem';
+ import ListItemButton from '@mui/material/ListItemButton';
+ import ListItemText from '@mui/material/ListItemText';
+ import CircularProgress from '@mui/material/CircularProgress';
+ import Chip from '@mui/material/Chip';
+ import Alert from '@mui/material/Alert';
+ import Divider from '@mui/material/Divider';
+ 
+ /**
+  * BQOXenditChannelView
+  *
+  * Daftar channel pembayaran Xendit untuk qorestoweb.
+  * Mengikuti pola XenditChannelView di webcsa-v2 (trenly):
+  *   1. Fetch dari PHP gateway: {PAYMENT_API}/get-payment-channels.php
+  *   2. Jika API tidak tersedia → fallback ke daftar hardcoded
+  *   3. Tidak bergantung pada bbank_x backend CSA
+  *
+  * Props:
+  *   selectedChannel  - { code, name, category } | null
+  *   onSelect         - fn(channel) dipanggil saat user pilih channel
  // ... (truncated)
+                                   label="✓" size="small" color="info"
+                                   sx={{ height: 16, fontSize: 10 }}
+                                 />
+                               )}
+                             </Box>
+                           }
+                           secondary={
+                             <Typography variant="caption" color="text.secondary">
+                               {ch.code}
+                             </Typography>
+                           }
+                         />
+                       </ListItemButton>
+                     </ListItem>
+                   );
+                 })}
+               </List>
+               <Divider />
+             </Box>
+           ))
+         )}
+       </Box>
+     </Box>
+   );
+ }
```

---

### 🔐 Auth/Session

#### 1. rc/scripts/contexts/AuthContext.js [20260730_104803]
**Fungsi:** Context autentikasi global  
**Perubahan:** Pembaruan kode  

---

### ⚙️ Config

#### 1. env/qorestoweb/.env [20260730_095820]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 6

```javascript
// Line 3:
- REACT_APP_USE_XENDIT_PAYMENT=N
+ REACT_APP_USE_XENDIT_PAYMENT=Y
```

---

#### 2. package.json [20260730_095820]
**Fungsi:** Implementasi: package  
**Perubahan:** Tambah/ubah npm script  
**Lines:** 23, 46-50

```javascript
// Line 20:
+     "react-qr-code": "2.2.0",
// Line 43:
-     "dev:qorestoweb":          "env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.dev yarn start",
-     "qa:qorestoweb":           "env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.qa yarn start",
-     "prod:qorestoweb":         "env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.prod node build-deploy.cjs --mode=primary",
-     "prod:qorestoweb-cadangan":"env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.prod.cadangan node build-deploy.cjs --mode=cadangan",
-     "prod:qorestoweb-all":     "yarn prod:qorestoweb && yarn prod:qorestoweb-cadangan",
+     "dev:qorestoweb": "env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.dev yarn start",
+     "qa:qorestoweb": "env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.qa yarn start",
+     "prod:qorestoweb": "env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.prod node build-deploy.cjs --mode=primary",
+     "prod:qorestoweb-cadangan": "env-cmd -f ./env/qorestoweb/.env env-cmd -f ./env/qorestoweb/.env.prod.cadangan node build-deploy.cjs --mode=cadangan",
+     "prod:qorestoweb-all": "yarn prod:qorestoweb && yarn prod:qorestoweb-cadangan",
```

---

#### 3. env/qorestoweb/.env [20260730_090041]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1, 3-19

```javascript
// Line 1:
+ # ============================================================
- REACT_APP_USE_XENDIT_PAYMENT=Y
- REACT_APP_XENDIT_MODE=invoice
- REACT_APP_CASH_BANK_CODE=TUNAI
- REACT_APP_XENDIT_BANK_CODE=XENDIT
+ # ============================================================
+ 
+ # Payment Gateway Xendit — Y untuk aktifkan pilihan Xendit di dialog bayar
+ REACT_APP_USE_XENDIT_PAYMENT=N
+ 
+ # Xendit Mode:
+ #   invoice         → create-invoice.php  (customer buka link Xendit)
+ #   payment-request → create-payment-request.php  (QR/VA langsung di layar)
+ REACT_APP_XENDIT_MODE=payment-request
+ 
+ # Kode bank untuk metode pembayaran
+ REACT_APP_CASH_BANK_CODE=T000
+ REACT_APP_XENDIT_BANK_CODE=X000
+ 
+ # Xendit Public Key (untuk tokenisasi kartu kredit via Xendit.js)
+ # Ganti dengan key production saat go-live
+ REACT_APP_XENDIT_PUBLIC_KEY=xnd_public_development_3i9lTlTqOtFlCFrav8uW1wv60etjnECTV77tFcxJ_p5oUBjUpGUj9T1BsbL3a5nT
```

---

#### 4. env/qorestoweb/.env.dev [20260730_090041]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12, 15-16, 20

```javascript
// Line 1:
+ # ============================================================
+ # Development — API ke .13 sebagai utama
+ # ============================================================
+ 
// Line 9:
- # API
+ # API CSA — utama: .13, fallback: .85
+ 
+ # Payment Gateway Xendit
- # Mock — aktif di development
+ # Mock — aktif di development (bqo_x belum siap di backend)
```

---

#### 5. env/qorestoweb/.env.prod [20260730_090041]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12, 15-16

```javascript
// Line 1:
+ # ============================================================
+ # Production PRIMARY — .13 sebagai utama, .85 sebagai fallback
+ # ============================================================
+ 
// Line 9:
- # API — server utama: .13, fallback: .85
+ # API CSA — server utama: .13, fallback: .85
+ 
+ # Payment Gateway Xendit
```

---

#### 6. env/qorestoweb/.env.prod.cadangan [20260730_090041]
**Fungsi:** Implementasi: .env.prod  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12, 15-16

```javascript
// Line 1:
+ # ============================================================
+ # Production CADANGAN — .85 sebagai utama, .13 sebagai fallback
+ # ============================================================
+ 
// Line 9:
- # API — server cadangan: .85 sebagai utama, .13 sebagai fallback
+ # API CSA — server cadangan: .85 sebagai utama, .13 sebagai fallback
+ 
+ # Payment Gateway Xendit — .85 sebagai utama, .13 sebagai fallback
```

---

#### 7. env/qorestoweb/.env.qa [20260730_090041]
**Fungsi:** Implementasi: .env  
**Perubahan:** Ubah konfigurasi environment / API endpoint  
**Lines:** 1-4, 12

```javascript
// Line 1:
+ # ============================================================
+ # QA / Testing — API ke localhost
+ # ============================================================
+ 
// Line 9:
- # API
+ # API CSA — lokal untuk testing
```

---

### ⚙️ Others

#### 1. public/app.cfg [20260730_095820]
**Fungsi:** Entry point aplikasi React  
**Perubahan:** Pembaruan kode  
**Lines:** 8

```javascript
// Line 5:
-   "xendit_show_simulate": false
+   "xendit_show_simulate": true
```

---

#### 2. yarn.lock [20260730_095820]
**Fungsi:** Implementasi: yarn  
**Perubahan:** Pembaruan kode  
**Lines:** 37, 333-337, 383, 833, 1269, 1299, 1582-1588, 1649-1661, 1770, 1854, 2129, 2330, 2458, 2474-2481, 2527, 2554, 2655, 2726-2730, 2770, 2780, 2831, 2866-2873, 3305, 3333, 3429, 3447, 3551-3555, 3804-3807, 3809, 3812, 3918, 3964, 3971, 3978-3981, 3983, 4064-4068, 4079, 4165-4172, 4182-4185, 4605-4608, 4610, 4669, 4706, 4764-4768, 5118, 5138-5142, 5231, 5532, 5539-5542, 5544, 5607, 5631-5638, 6083-6092, 6192-6201, 6212, 6214-6215, 6217-6219, 6221-6223, 6225-6226, 6258, 6260-6261, 6264, 6280-6284, 6304, 6411-6422, 6526, 6535, 6918-6922, 7009-7013, 7051-7055, 7419, 7424, 7429, 8013-8021, 8040-8049, 8089, 8123-8127, 8222, 8251, 8283-8291, 8381, 8586, 8625, 8650, 8720-8728, 8770, 8867, 8985, 8990-8993, 9181-9194, 9357, 9506, 9589, 9867, 9932, 9960, 10089, 10091-10092, 10103-10109, 10160, 10162-10165, 10172, 10174-10175, 10185, 10187-10188, 10202, 10204-10205, 10207, 10209-10210, 10219, 10221-10222, 10235, 10237-10238, 10249-10255, 10275, 10277-10278, 10289, 10291-10292, 10305-10312, 10391

```javascript
// Line 34:
- "@babel/core@^7.0.0", "@babel/core@^7.0.0 || ^8.0.0-0", "@babel/core@^7.0.0-0", "@babel/core@^7.0.0-0 || ^8.0.0-0 <8.0.0", "@babel/core@^7.1.0", "@babel/core@^7.11.0", "@babel/core@^7.11.1", "@babel/core@^7.12.0", "@babel/core@^7.12.3", "@babel/core@^7.13.0", "@babel/core@^7.16.0", "@babel/core@^7.4.0 || ^8.0.0-0 <8.0.0", "@babel/core@^7.7.2", "@babel/core@^7.8.0":
+ "@babel/core@^7.1.0", "@babel/core@^7.11.1", "@babel/core@^7.12.3", "@babel/core@^7.16.0", "@babel/core@^7.7.2", "@babel/core@^7.8.0":
// Line 330:
+ "@babel/plugin-proposal-private-property-in-object@7.21.0-placeholder-for-preset-env.2":
+   version "7.21.0-placeholder-for-preset-env.2"
+   resolved "https://registry.npmjs.org/@babel/plugin-proposal-private-property-in-object/-/plugin-proposal-private-property-in-object-7.21.0-placeholder-for-preset-env.2.tgz"
+   integrity sha512-SOSkfJDddaM7mak6cPEpswyTRnuRltl429hMraQEglW+OkovnCzsiszTmsrlY//qLFjCpQDFRvjdm2wA5pPm9w==
+ 
// Line 345:
- "@babel/plugin-proposal-private-property-in-object@7.21.0-placeholder-for-preset-env.2":
-   version "7.21.0-placeholder-for-preset-env.2"
-   resolved "https://registry.npmjs.org/@babel/plugin-proposal-private-property-in-object/-/plugin-proposal-private-property-in-object-7.21.0-placeholder-for-preset-env.2.tgz"
-   integrity sha512-SOSkfJDddaM7mak6cPEpswyTRnuRltl429hMraQEglW+OkovnCzsiszTmsrlY//qLFjCpQDFRvjdm2wA5pPm9w==
- 
// Line 380:
- "@babel/plugin-syntax-flow@^7.14.5", "@babel/plugin-syntax-flow@^7.29.7":
+ "@babel/plugin-syntax-flow@^7.29.7":
// Line 830:
- "@babel/plugin-transform-react-jsx@^7.14.9", "@babel/plugin-transform-react-jsx@^7.29.7":
+ "@babel/plugin-transform-react-jsx@^7.29.7":
// Line 1266:
- "@emotion/react@^11.0.0-rc.0", "@emotion/react@^11.4.1", "@emotion/react@^11.5.0", "@emotion/react@^11.7.1":
+ "@emotion/react@^11.7.1":
// Line 1296:
  // ... (truncated)
+ workbox-routing@^5.1.4:
-   resolved "https://registry.npmjs.org/workbox-strategies/-/workbox-strategies-5.1.4.tgz"
-   integrity sha512-VVS57LpaJTdjW3RgZvPwX0NlhNmscR7OQ9bP+N/34cYMDzXLyA6kqWffP6QKXSkca1OFo/v6v7hW7zrrguo6EA==
+   resolved "https://registry.npmjs.org/workbox-routing/-/workbox-routing-5.1.4.tgz"
+   integrity sha512-8ljknRfqE1vEQtnMtzfksL+UXO822jJlHTIR7+BtJuxQ17+WPZfsHqvk1ynR/v0EHik4x2+826Hkwpgh4GKDCw==
-     workbox-routing "^5.1.4"
// Line 10286:
- workbox-streams@^5.1.4:
+ workbox-strategies@^5.1.4:
-   resolved "https://registry.npmjs.org/workbox-streams/-/workbox-streams-5.1.4.tgz"
-   integrity sha512-xU8yuF1hI/XcVhJUAfbQLa1guQUhdLMPQJkdT0kn6HP5CwiPOGiXnSFq80rAG4b1kJUChQQIGPrq439FQUNVrw==
+   resolved "https://registry.npmjs.org/workbox-strategies/-/workbox-strategies-5.1.4.tgz"
+   integrity sha512-VVS57LpaJTdjW3RgZvPwX0NlhNmscR7OQ9bP+N/34cYMDzXLyA6kqWffP6QKXSkca1OFo/v6v7hW7zrrguo6EA==
// Line 10302:
+ workbox-streams@^5.1.4:
+   version "5.1.4"
+   resolved "https://registry.npmjs.org/workbox-streams/-/workbox-streams-5.1.4.tgz"
+   integrity sha512-xU8yuF1hI/XcVhJUAfbQLa1guQUhdLMPQJkdT0kn6HP5CwiPOGiXnSFq80rAG4b1kJUChQQIGPrq439FQUNVrw==
+   dependencies:
+     workbox-core "^5.1.4"
+     workbox-routing "^5.1.4"
+ 
// Line 10388:
- yaml@^1.10.0, yaml@^1.10.2, yaml@^1.7.2, yaml@^2.4.2:
+ yaml@^1.10.0, yaml@^1.10.2, yaml@^1.7.2:
```

---

## 📊 **Summary**
- **✨ Features:** 5 items
- **📖 Documentation:** 2 items
- **🎨 UI/UX:** 1 item
- **🔐 Auth/Session:** 1 item
- **⚙️ Config:** 7 items
- **⚙️ Others:** 2 items
- **Total Files Modified:** 18
- **Main Focus:** ⚙️ Config
