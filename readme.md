# QORESTOWEB
***

## Status
Discontinue (Project ini hanya digunakan untuk research, untuk project serupa yang masih aktif pindah ke .\PROJECTS\webcsa-v2\src\scripts\modules\BQO)

## Deskripsi
Quick Order Resto Web adalah aplikasi untuk melakukan pemesanan cepat atau Quick Order yang dapat diakses melalui Web, dan jika sudah submit, sistem akan mengirimkan data input ke API Software CSA.

## Fitur
* Halaman Login
* Halaman Menu
* Halaman Detail
* Halaman Checkout

## Struktur
* build, folder hasil build kode proyek untuk mode produksi.
* public, folder untuk kode tambahan yang akan dicopy ke folder build.
* src, folder kode utama 
  * images, folder aset gambar.
  * scripts, folder kode untuk jalannya sistem aplikasi web.
    * components, folder kode untuk komponen UI aplikasi.
    * context, folder kode untuk konteks Auth, Module dan Theme.
    * hooks, folder kode untuk fungsi hooks.
    * modules, folder kode tiap module.
    * routes, folder kode routing aplikasi.
    * utils, folder kode utilitas yang digunakan aplikasi.
    * App.js, folder kode wrapper untuk menyatukan seluruh komponen.
    * Config.js, folder kode untuk konfigurasi aplikasi seperti Base URL, default value, dan lainnya.
  * styles, folder kode untuk mengelola tampilan web.
  * tests, folder kode untuk melakukan test di development.
  * index.js, file script utama untuk registrasi kode proyek ke html.
  * reportWebVitals.js, file script untuk melakukan cek Web Vital seperti Performance dan Audit.
  * service-worker.js, file script untuk service worker PWA.
  * serverWorkerRegistration.js, file script untuk melakukan registrasi service worker PWA.
  * setupTests.js, file script untuk melakukan registrasi file test.
* .env-cmdrc, file untuk konfigurasi baseURL ataupun base API Endpoint.
* .gitignore, file script untuk pengecualian git.
* package.json, file script untuk mengatur versi, dependensi, command dan lainnya.
* yarn.lock,  file kunci untuk menetapkan dependensi aplikasi.

## Prasyarat

Pastikan sudah terinstall:
* [Node.js](https://nodejs.org/) v16 atau lebih baru
* [Yarn](https://yarnpkg.com/) (classic v1 atau v3+)

---

## Instalasi

```bash
# Clone repository
git clone https://github.com/dhe2en832/qorestoweb.git
cd qorestoweb

# Install semua dependensi
yarn
```

---

## Konfigurasi

Edit file `.env-cmdrc` di root project untuk menyesuaikan API endpoint per environment:

```json
{
  "development": {
    "REACT_APP_STATUS": "development",
    "REACT_APP_API_ENDPOINT": "http://192.168.100.85/api",
    "PUBLIC_URL": "/qorestoweb/"
  },
  "staging": {
    "REACT_APP_STATUS": "staging",
    "REACT_APP_API_ENDPOINT": "http://192.168.100.85/api",
    "PUBLIC_URL": "/qorestoweb/"
  },
  "production": {
    "REACT_APP_STATUS": "production",
    "REACT_APP_API_ENDPOINT": "https://csacomputer.ddns.net/api",
    "PUBLIC_URL": "/qorestoweb/"
  }
}
```

---

## Menjalankan (Development)

```bash
# Mode development (localhost)
yarn start:dev

# Mode QA
yarn start:qa
```

Aplikasi akan berjalan di `http://localhost:3000/qorestoweb/`

---

## Build (Produksi)

```bash
# Build untuk staging
yarn build:staging

# Build untuk production
yarn build:prod
```

Hasil build tersimpan di folder `build/`. Copy seluruh isi folder `build/` ke web server (misal: `htdocs/qorestoweb/` di XAMPP).

---

## Deploy ke XAMPP (Lokal)

```bash
yarn build:staging
# Lalu copy folder build/ ke:
# C:\xampp\htdocs\qorestoweb\
```

Akses via browser: `http://localhost/qorestoweb/`

---

## Git & Push

Project ini menggunakan script `yarn ship` untuk commit dan push otomatis ke GitHub.

```bash
yarn ship
```

Script akan:
1. Cek apakah ada perubahan (`git status`)
2. Stage semua file (`git add -A`)
3. Buat commit message otomatis berisi tanggal dan daftar file yang berubah
4. Push ke branch `main` di remote `origin`

Untuk push manual biasa:
```bash
git add .
git commit -m "pesan commit"
git push
```

---

## Scripts Tersedia

| Command | Keterangan |
| --- | --- |
| `yarn start` | Jalankan dev server tanpa env |
| `yarn start:dev` | Jalankan dev server dengan env `development` |
| `yarn start:qa` | Jalankan dev server dengan env `qa` |
| `yarn build:staging` | Build untuk staging |
| `yarn build:prod` | Build untuk production |
| `yarn ship` | Auto commit + push ke GitHub |
| `yarn test` | Jalankan test |
| `yarn new-package` | Reset node_modules dan install ulang |

---

## Log
* Membuat UI dan Sistem Order makanan dengan melihat referensi https://delivery.usetada.com/
* Membuat UI daftar menu yang datanya diambil dari dummy file.json yang berada di folder public/data

## Masalah
\-

## Lainnya
| Kunci      | Keterangan                               |
| ---------- | ---------------------------------------- |
| Alamat     | http://192.168.100.85/qorestoweb         |
| Repository | https://github.com/dhe2en832/qorestoweb  |
| User       | WSALES1                                  |
| Password   | csa                                      |