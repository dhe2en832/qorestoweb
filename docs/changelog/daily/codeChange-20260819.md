# Code Changes Summary

## 19 Agustus 2026

### 📖 Documentation

#### 1. docs/changelog/daily/codeChange-20260819.md [20260819_105514]
**Fungsi:** Implementasi: codeChange-20260819  
**Perubahan:** Pembaruan kode  
**Lines:** 7-129, 359-370, 372, 375-376

```javascript
// Line 4:
- #### 1. docs/changelog/daily/codeChange-20260819.md [20260819_104757]
+ #### 1. docs/ALUR-QORESTOWEB.md [20260819_104952]
+ **Fungsi:** Implementasi: ALUR-QORESTOWEB  
+ **Perubahan:** Pembaruan kode  
+ **Lines:** 238-241, 243, 245-248, 250, 252-294
+ 
+ ```javascript
+ // Line 235:
+ - Akses: `http://{SERVER}/qorestoweb/qr-tables.html`
+ + ### Akses
+ + ```
+ + http://192.168.100.13/qorestoweb/qr-tables.html
+ + ```
+ - Fitur:
+ + ### Fitur
+ - - URL otomatis sesuai mode
+ + - **Dual QR per meja**: QR utama (besar) + QR cadangan (kecil)
+ + - QR utama → server `.13`, QR cadangan → server `.85`
+ + - Label "Jika tidak bisa dibuka, scan ini:" di QR cadangan
+ + - URL server utama dan cadangan bisa diedit manual
+ - - Print-friendly (Ctrl+P)
+ + - Print-friendly (Ctrl+P) — layout 3 kolom
+ + - Mode Development tidak tampilkan QR backup
+ + 
  // ... (truncated)
// Line 187:
- #### 2. ocs/ALUR-QORESTOWEB.md [20260819_104952]
- **Fungsi:** Implementasi: ALUR-QORESTOWEB  
- **Perubahan:** Pembaruan kode  
- 
- 
// Line 356:
+ #### 2. ublic/qr-tables.html [20260819_105513]
+ **Fungsi:** Implementasi: qr-tables  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ #### 3. public/vendor/ [20260819_105513]
+ **Fungsi:** Implementasi: vendor  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
- - **📖 Documentation:** 2 items
+ - **📖 Documentation:** 3 items
- - **⚙️ Others:** 1 item
- - **Total Files Modified:** 5
+ - **⚙️ Others:** 3 items
+ - **Total Files Modified:** 8
```

---

#### 2. docs/ALUR-QORESTOWEB.md [20260819_104952]
**Fungsi:** Implementasi: ALUR-QORESTOWEB  
**Perubahan:** Pembaruan kode  
**Lines:** 238-241, 243, 245-248, 250, 252-294

```javascript
// Line 235:
- Akses: `http://{SERVER}/qorestoweb/qr-tables.html`
+ ### Akses
+ ```
+ http://192.168.100.13/qorestoweb/qr-tables.html
+ ```
- Fitur:
+ ### Fitur
- - URL otomatis sesuai mode
+ - **Dual QR per meja**: QR utama (besar) + QR cadangan (kecil)
+ - QR utama → server `.13`, QR cadangan → server `.85`
+ - Label "Jika tidak bisa dibuka, scan ini:" di QR cadangan
+ - URL server utama dan cadangan bisa diedit manual
- - Print-friendly (Ctrl+P)
+ - Print-friendly (Ctrl+P) — layout 3 kolom
+ - Mode Development tidak tampilkan QR backup
+ 
+ ### Layout Card Meja (Production)
+ ```
+ ┌──────────────────────┐
+ │      QORESTO         │
+ │     Meja 07          │
+ │  ┌──────────────┐    │
+ │  │  QR UTAMA    │    │
+ │  │  (150x150)   │    │
  // ... (truncated)
+ └──────────────────────┘
+ ```
+ 
+ ---
+ 
+ ## 10. Fallback Server Cadangan
+ 
+ ### Arsitektur
+ - Server utama: `192.168.100.13` (host web app + API)
+ - Server cadangan: `192.168.100.85` (host web app + API yang sama)
+ - Qorestoweb di-deploy di **kedua server**
+ 
+ ### Fallback API (level aplikasi)
+ Jika server utama tidak bisa dijangkau (timeout/network error), semua API call otomatis dicoba ke server cadangan:
+ 
+ | Komponen | Primary | Fallback |
+ |----------|---------|----------|
+ | Login (`signinAsGuest`) | `.13/api/csa/resto/login_x` | `.85/api/csa/resto/login_x` |
+ | Menu (`bstock_x`) | `.13/api/csa/resto/bstock_x` | `.85/api/csa/resto/bstock_x` |
+ | Order (`bqo_x`) | `.13/api/csa/resto/bqo_x` | `.85/api/csa/resto/bqo_x` |
+ 
+ ### Keterbatasan
+ - Jika server utama mati dan pelanggan **belum pernah** mengakses app → halaman tidak bisa load (browser error)
+ - Solusi: **2 QR per meja** — pelanggan scan QR cadangan yang mengarah ke `.85`
+ - Jika pelanggan **pernah** mengakses sebelumnya → service worker bisa serve halaman dari cache
```

---

#### 3. docs/changelog/daily/codeChange-20260819.md [20260819_104952]
**Fungsi:** Implementasi: codeChange-20260819  
**Perubahan:** Tambah error handling; Tambah HTTP request  
**Lines:** 5-73, 182, 185-239, 244, 248-249

```javascript
// Line 2:
+ ### 📖 Documentation
+ 
+ #### 1. docs/changelog/daily/codeChange-20260819.md [20260819_104757]
+ **Fungsi:** Implementasi: codeChange-20260819  
+ **Perubahan:** Tambah error handling; Tambah HTTP request  
+ **Lines:** 1-124
+ 
+ ```javascript
+ // Line 1:
+ + # Code Changes Summary
+ + 
+ + ## 19 Agustus 2026
+ + 
+ + ### 🔐 Auth/Session
+ + 
+ + #### 1. src/scripts/contexts/AuthContext.js [20260819_104757]
+ + **Fungsi:** Context autentikasi global  
+ + **Perubahan:** Tambah fungsi: localUrl; Tambah error handling; Tambah HTTP request  
+ + **Lines:** 94-122
+ + 
+ + ```javascript
+ + // Line 91:
+ + -       // Network error — fallback ke static key
+ + +       // Network error pada server utama — coba login ke server cadangan
  // ... (truncated)
+ -         // Generate QR
+ +         // QR utama — besar
+ -           text:         url,
+ +           text:         urlPrimary,
+ -           colorDark:    isDev ? '#c0390b' : '#222222',  // merah untuk dev, hitam untuk prod
+ +           colorDark:    isDev ? '#c0390b' : '#222222',
+ + 
+ +         // QR cadangan — kecil
+ +         if (urlBackup && !isDev) {
+ +           new QRCode(document.getElementById(`qr-backup-${tableId}`), {
+ +             text:         urlBackup,
+ +             width:        80,
+ +             height:       80,
+ +             colorDark:    '#666666',
+ +             colorLight:   '#ffffff',
+ +             correctLevel: QRCode.CorrectLevel.L,
+ +           });
+ +         }
+ -     // Auto-generate saat halaman load
+ ```
+ - **📖 Documentation:** 2 items
- - **Total Files Modified:** 3
- - **Main Focus:** 🔐 Auth/Session
+ - **Total Files Modified:** 5
+ - **Main Focus:** 📖 Documentation
```

---

#### 4. docs/changelog/daily/codeChange-20260819.md [20260819_104757]
**Fungsi:** Implementasi: codeChange-20260819  
**Perubahan:** Tambah error handling; Tambah HTTP request  
**Lines:** 1-124

```javascript
// Line 1:
+ # Code Changes Summary
+ 
+ ## 19 Agustus 2026
+ 
+ ### 🔐 Auth/Session
+ 
+ #### 1. src/scripts/contexts/AuthContext.js [20260819_104757]
+ **Fungsi:** Context autentikasi global  
+ **Perubahan:** Tambah fungsi: localUrl; Tambah error handling; Tambah HTTP request  
+ **Lines:** 94-122
+ 
+ ```javascript
+ // Line 91:
+ -       // Network error — fallback ke static key
+ +       // Network error pada server utama — coba login ke server cadangan
+ +       const localUrl = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();
+ +       if (localUrl) {
+ +         try {
+ +           const res2 = await fetch(`${localUrl}/csa/resto/login_x`, {
+ +             method: 'POST',
+ +             headers: {
+ +               'content-type': 'application/json',
+ +               'x-user':     guestUser,
+ +               'x-password': guestPass,
  // ... (truncated)
+ +     // Logout dari server cadangan
+ // Line 220:
+ -     // Bersihkan safety net
+ -     window.sessionStorage.removeItem('local_stale_secretkey');
+ -     window.sessionStorage.removeItem('local_stale_sessionid');
+ -     window.sessionStorage.removeItem('local_stale_userid');
+ - 
+ ```
+ 
+ ---
+ 
+ ### ⚙️ Others
+ 
+ #### 1. ublic/qr-tables.html [20260819_104757]
+ **Fungsi:** Implementasi: qr-tables  
+ **Perubahan:** Pembaruan kode  
+ 
+ ---
+ 
+ ## 📊 **Summary**
+ - **🔐 Auth/Session:** 1 item
+ - **🔌 API:** 1 item
+ - **⚙️ Others:** 1 item
+ - **Total Files Modified:** 3
+ - **Main Focus:** 🔐 Auth/Session
```

---

### 🔐 Auth/Session

#### 1. src/scripts/contexts/AuthContext.js [20260819_104757]
**Fungsi:** Context autentikasi global  
**Perubahan:** Tambah fungsi: localUrl; Tambah error handling; Tambah HTTP request  
**Lines:** 94-122

```javascript
// Line 91:
-       // Network error — fallback ke static key
+       // Network error pada server utama — coba login ke server cadangan
+       const localUrl = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();
+       if (localUrl) {
+         try {
+           const res2 = await fetch(`${localUrl}/csa/resto/login_x`, {
+             method: 'POST',
+             headers: {
+               'content-type': 'application/json',
+               'x-user':     guestUser,
+               'x-password': guestPass,
+             },
+             body: JSON.stringify({ action: 'login' }),
+             signal: AbortSignal.timeout(10000),
+           });
+           const key2 = res2.headers.get('secretkey');
+           const id2  = res2.headers.get('sessionid');
+           const json2 = await res2.json();
+           if (json2.result === true) {
+             setLoggedIn(true);
+             setUserID(guestUser);
+             setSessionTimeout(false);
+             setSessionKey(key2);
+             setSessionID(id2);
+             if (typeof cb === 'function') cb();
+             return;
+           }
+         } catch (_2) { /* server cadangan juga gagal */ }
+       }
+       // Kedua server gagal — fallback ke static key
```

---

### 🔌 API

#### 1. src/scripts/modules/BQO/controllers/bqo_api.js [20260819_104757]
**Fungsi:** Modul: bqo_api  
**Perubahan:** Tambah fungsi: isNetworkError; Tambah error handling; Tambah HTTP request  
**Lines:** 6, 15, 19-31, 38-68, 75-91, 100-116, 138, 147, 161-162, 166, 176, 193, 196, 208

```javascript
// Line 3:
- // URL server lokal sebagai fallback. Kosong = fitur lokal tidak aktif.
+ // URL server cadangan sebagai fallback. Kosong = fitur fallback tidak aktif.
// Line 12:
- // usebrwdef dikontrol via Config.USE_BRWDEF (bukan env — konsisten dengan webcsa-v2)
+ // usebrwdef dikontrol via Config.USE_BRWDEF
+ /**
+  * Helper: cek apakah error adalah network error (server tidak bisa dijangkau)
+  */
+ const isNetworkError = (err) =>
+   err instanceof TypeError ||
+   err instanceof DOMException ||
+   (err && err.name === 'AbortError') ||
+   (err && err.message && (
+     err.message.includes('Failed to fetch') ||
+     err.message.includes('NetworkError') ||
+     err.message.includes('timeout')
+   ));
+ 
+   // ── Generic fetch dengan fallback ke server cadangan ─────────────────────
+   /**
+    * _fetchWithFallback — coba fetch ke URL utama, jika gagal (network) coba ke cadangan.
+    * @param {string} primaryUrl - URL endpoint utama
+    * @param {string} fallbackUrl - URL endpoint cadangan (opsional)
+    * @param {object} options - fetch options (method, headers, body, signal)
  // ... (truncated)
+    * Untuk backward compatibility dengan bqo_payment.js yang sudah pakai ini.
-       throw new Error('Server lokal tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
+       throw new Error('Server cadangan tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
// Line 173:
-     // Login ke server lokal
+     // Login ke server cadangan
// Line 190:
-       throw new Error('Login ke server lokal gagal: ' + (loginJson.onfail?.cerror || 'Unknown error'));
+       throw new Error('Login ke server cadangan gagal: ' + (loginJson.onfail?.cerror || 'Unknown error'));
-     // Safety net — bersihkan jika terjadi crash sebelum logout
-     window.sessionStorage.setItem('local_stale_secretkey', localSessionKey);
-     window.sessionStorage.setItem('local_stale_sessionid', localSessionID);
-     window.sessionStorage.setItem('local_stale_userid',    localUser);
- 
-     // Kirim transaksi ke server lokal
+     // Kirim transaksi ke server cadangan
// Line 205:
-     // Logout dari server lokal
+     // Logout dari server cadangan
// Line 220:
-     // Bersihkan safety net
-     window.sessionStorage.removeItem('local_stale_secretkey');
-     window.sessionStorage.removeItem('local_stale_sessionid');
-     window.sessionStorage.removeItem('local_stale_userid');
- 
```

---

### ⚙️ Others

#### 1. public/qr-tables.html [20260819_105514]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  
**Lines:** 7-13

```javascript
// Line 4:
-   <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
+   <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
+   <script>
+     // Fallback: jika CDN gagal load, coba dari file lokal
+     if (typeof QRCode === 'undefined') {
+       document.write('<script src="vendor/qrcode.min.js"><\/script>');
+     }
+   </script>
```

---

#### 2. public/vendor/qrcode.min.js [20260819_105514]
**Fungsi:** Implementasi: qrcode.min  
**Perubahan:** Pembaruan kode  
**Lines:** 1

```javascript
// Line 1:
+ var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
```

---

#### 3. public/qr-tables.html [20260819_104757]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  
**Lines:** 84, 100, 130, 146, 149, 167, 174, 180, 186-213, 221, 227, 262, 265-268, 289, 291-292, 305, 308, 311-312, 322, 335-336, 340-351, 358, 362, 364, 367, 371-382

```javascript
// Line 81:
-       max-width: 640px;
+       max-width: 700px;
// Line 97:
-       min-width: 160px;
+       min-width: 140px;
// Line 127:
-       grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
+       grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
// Line 143:
-     .card.dev-card {
-       border: 2px dashed #e67e22;
-     }
+     .card.dev-card { border: 2px dashed #e67e22; }
-       font-size: 0.65rem;
+       font-size: 0.6rem;
// Line 155:
- 
// Line 164:
-       margin-bottom: 4px;
-       margin-top: 4px;
+       margin: 4px 0;
-       margin-bottom: 12px;
+       margin-bottom: 10px;
-       margin-bottom: 12px;
  // ... (truncated)
+             </div>
+           `;
+         }
+ 
-           <div class="url-text">${url}</div>
+           ${backupHTML}
-         // Generate QR
+         // QR utama — besar
-           text:         url,
+           text:         urlPrimary,
-           colorDark:    isDev ? '#c0390b' : '#222222',  // merah untuk dev, hitam untuk prod
+           colorDark:    isDev ? '#c0390b' : '#222222',
+ 
+         // QR cadangan — kecil
+         if (urlBackup && !isDev) {
+           new QRCode(document.getElementById(`qr-backup-${tableId}`), {
+             text:         urlBackup,
+             width:        80,
+             height:       80,
+             colorDark:    '#666666',
+             colorLight:   '#ffffff',
+             correctLevel: QRCode.CorrectLevel.L,
+           });
+         }
-     // Auto-generate saat halaman load
```

---

#### 4. ublic/qr-tables.html [20260819_155829]
**Fungsi:** Implementasi: qr-tables  
**Perubahan:** Pembaruan kode  

---

## 📊 **Summary**
- **📖 Documentation:** 4 items
- **🔐 Auth/Session:** 1 item
- **🔌 API:** 1 item
- **⚙️ Others:** 4 items
- **Total Files Modified:** 10
- **Main Focus:** 📖 Documentation
