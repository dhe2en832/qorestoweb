/**
 * app-config.js
 *
 * Membaca konfigurasi runtime dari file app.cfg di folder build.
 * File ini bisa diedit langsung di server tanpa rebuild.
 *
 * Lokasi file: {PUBLIC_URL}/app.cfg
 */

const APP_CONFIG_KEY      = 'qoAppConfig';
const APP_CONFIG_FILENAME = 'app.cfg';
const _publicUrl = (process.env.PUBLIC_URL || '/').replace(/\/?$/, '/');
const APP_CONFIG_ENDPOINT =
  window.location.origin + _publicUrl + APP_CONFIG_FILENAME;

const DEFAULT_CONFIG = {
  enable_fail_download:          false,
  debug_save_fail:               '', // 'network_error' | 'backend_reject' | ''
  debug_local_save_fail:         '', // 'network_error' | ''
  server_mode:                   'primary', // 'primary' | 'local'
  server_label:                  '',
  xendit_payment_timeout_minutes: 5,
  xendit_show_simulate:          false,
  use_mock_bqo:                  false, // true = pakai data mock (tanpa backend)
  qr_session_key:                '',
  qr_guest_user:                 'GUEST',
  qr_guest_pass:                 '',
  debug_screen:                  false,
  show_print_button:             true,  // false = sembunyikan tombol print di struk kasir
  show_tunai_button:             true,  // false = sembunyikan opsi bayar tunai

  // ── Konfigurasi Pajak / PPN ──────────────────────────────────────────────
  // tax_mode          : 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
  //   EXCLUSIVE → harga item BELUM include PPN; frontend tambahkan PPN di akhir;
  //               payload kirim npctppn = tax_rate
  //   INCLUSIVE → harga item SUDAH include PPN; tampilkan breakdown PPN sebagai
  //               informasi; payload tetap kirim npctppn = tax_rate (backend
  //               reverse-hitung PPN dari nilai transaksi)
  //   NONE      → frontend tidak peduli PPN; payload kirim npctppn = 0;
  //               backend yang memutuskan penanganan PPN sepenuhnya
  //
  // tax_rate          : rate PPN dasar dalam persen (angka), contoh: 12
  //                     Diabaikan saat tax_mode = 'NONE'
  //
  // tax_effective_rate: faktor DPP — bisa angka (1) atau pecahan string ("11/12")
  //                     Sesuai PMK 131/2024: DPP Nilai Lain = 11/12 dari harga
  //                     Diabaikan saat tax_mode = 'NONE'
  //                     Contoh: tax_rate=12, tax_effective_rate="11/12"
  //                             → pajak efektif ke pelanggan = 12 × 11/12 = 11%
  // ────────────────────────────────────────────────────────────────────────
  tax_mode:           'EXCLUSIVE', // 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
  tax_rate:           12,
  tax_effective_rate: '11/12',
};

let _cachedConfig = null;

/**
 * Fetch app.cfg dari server dan simpan ke memory + sessionStorage.
 * Panggil sekali saat app init.
 */
export const loadAppConfig = async () => {
  try {
    const res  = await fetch(`${APP_CONFIG_ENDPOINT}?_=${Date.now()}`, { cache: 'no-store' });
    const data = await res.json();
    _cachedConfig = { ...DEFAULT_CONFIG, ...data };
    window.sessionStorage.setItem(APP_CONFIG_KEY, JSON.stringify(_cachedConfig));
    return _cachedConfig;
  } catch (_) {
    _cachedConfig = { ...DEFAULT_CONFIG };
    return _cachedConfig;
  }
};

/**
 * Baca config dari memory/sessionStorage (sync).
 */
export const getAppConfig = () => {
  if (_cachedConfig) return _cachedConfig;
  try {
    const stored = window.sessionStorage.getItem(APP_CONFIG_KEY);
    if (stored) {
      _cachedConfig = JSON.parse(stored);
      return _cachedConfig;
    }
  } catch (_) { /* ignore */ }
  return { ...DEFAULT_CONFIG };
};

/**
 * Shorthand cek satu flag boolean.
 */
export const isFeatureEnabled = (key) => {
  const config = getAppConfig();
  return config[key] === true;
};

/**
 * Baca dan parse konfigurasi pajak dari app.cfg.
 *
 * Return:
 *   mode          : 'EXCLUSIVE' | 'INCLUSIVE' | 'NONE'
 *   rate          : number  — rate PPN dasar (contoh: 12)
 *   effectiveRate : number  — faktor DPP sudah di-parse (contoh: 11/12 → 0.9166...)
 *   effectivePct  : number  — persen PPN efektif ke pelanggan (rate × effectiveRate)
 *                            Contoh: 12 × (11/12) = 11
 *
 * Penggunaan:
 *   const { mode, rate, effectivePct } = getTaxConfig();
 *   if (mode === 'EXCLUSIVE') { ... tambah PPN ke subtotal ... }
 *   if (mode === 'NONE')      { npctppn = 0 }
 *   else                      { npctppn = rate }
 */
export const getTaxConfig = () => {
  const config = getAppConfig();

  const mode = (config.tax_mode || 'EXCLUSIVE').toUpperCase();

  if (mode === 'NONE') {
    return { mode: 'NONE', rate: 0, effectiveRate: 1, effectivePct: 0 };
  }

  const rate = parseFloat(config.tax_rate ?? 12);

  // tax_effective_rate bisa string "11/12" atau angka 1
  const rawEffRate = config.tax_effective_rate ?? 1;
  let effectiveRate;
  if (typeof rawEffRate === 'string' && rawEffRate.includes('/')) {
    const [a, b] = rawEffRate.split('/');
    effectiveRate = parseFloat(a) / parseFloat(b);
  } else {
    effectiveRate = parseFloat(rawEffRate) || 1;
  }

  const effectivePct = rate * effectiveRate; // mis: 12 × (11/12) = 11

  return { mode, rate, effectiveRate, effectivePct };
};
