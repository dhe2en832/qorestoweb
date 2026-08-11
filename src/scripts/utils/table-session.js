/**
 * table-session.js
 *
 * Mengelola nomor meja (CTABID) yang diperoleh dari URL parameter ?table=XX.
 *
 * Flow:
 *   1. Saat app pertama load, baca ?table=XX dari URL
 *   2. Simpan ke sessionStorage agar persist selama sesi browser
 *   3. Seluruh bagian app cukup panggil getTableId() untuk dapat nilai CTABID
 *
 * Contoh URL: https://192.168.100.13/qorestoweb?table=01
 * Hasil      : getTableId() → "01"
 */

const TABLE_SESSION_KEY = 'qoTableId';

/**
 * Inisialisasi table ID dari URL query param.
 * Panggil sekali saat app mount (di App.js).
 * Jika URL tidak punya ?table=, nilai lama di sessionStorage tetap dipakai.
 */
export const initTableId = () => {
  const params  = new URLSearchParams(window.location.search);
  const fromUrl = params.get('table');
  if (fromUrl && fromUrl.trim() !== '') {
    window.sessionStorage.setItem(TABLE_SESSION_KEY, fromUrl.trim());
  }
};

/**
 * Ambil table ID saat ini.
 * @returns {string} CTABID, atau string kosong jika belum di-set.
 */
export const getTableId = () => {
  return window.sessionStorage.getItem(TABLE_SESSION_KEY) || '';
};

/**
 * Set table ID secara manual (opsional, untuk keperluan testing).
 */
export const setTableId = (id) => {
  if (id && id.trim() !== '') {
    window.sessionStorage.setItem(TABLE_SESSION_KEY, id.trim());
  }
};

/**
 * Hapus table ID (misal saat logout atau sesi berakhir).
 */
export const clearTableId = () => {
  window.sessionStorage.removeItem(TABLE_SESSION_KEY);
};
