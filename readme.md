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

## Log
* Membuat UI dan Sistem Order makanan dengan melihat referensi https://delivery.usetada.com/
* Membuat UI daftar menu yang datanya diambil dari dummy file.json yang berada di folder public/data

## Masalah
\-

## Lainnya
| Kunci    | Keterangan                          |
| -------  | -------                             |
| Alamat   | http://192.168.100.85/qorestoweb    |
| User     | WSALES1                             |
| Password | csa                                 |