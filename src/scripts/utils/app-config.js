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
const APP_CONFIG_ENDPOINT =
  window.location.origin + (process.env.PUBLIC_URL || '/') + APP_CONFIG_FILENAME;

const DEFAULT_CONFIG = {
  enable_fail_download:          false,
  debug_save_fail:               '', // 'network_error' | 'backend_reject' | ''
  debug_local_save_fail:         '', // 'network_error' | ''
  server_mode:                   'primary', // 'primary' | 'local'
  server_label:                  '',
  xendit_payment_timeout_minutes: 5,
  xendit_show_simulate:          false,
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
