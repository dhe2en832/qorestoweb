import Config from '../../../Config';
import ApiRoute from '../../../routes/ApiRoute';
import bqo_mock from './bqo_mock';
import { getAppConfig } from '../../../utils/app-config';

// URL server cadangan sebagai fallback. Kosong = fitur fallback tidak aktif.
const LOCAL_BASE_URL = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();

// Field minimal yang diambil dari bstock_x untuk katalog menu
const MENU_LISTFIELDS = [
  'cstocode', 'cstoname', 'cstoname2', 'nhrgjua', 'ndisc',
  'cfamcode', 'cprocod', 'csatuan', 'cnotes1',
];

// usebrwdef dikontrol via Config.USE_BRWDEF
// getimage dikontrol via env REACT_APP_MENU_GETIMAGE
const MENU_GETIMAGE = process.env.REACT_APP_MENU_GETIMAGE === 'Y';

/**
 * Helper: cek apakah error adalah network error (server tidak bisa dijangkau)
 */
const isNetworkError = (err) =>
  err instanceof TypeError ||
  err instanceof DOMException ||
  (err && err.name === 'AbortError') ||
  (err && err.message && (
    err.message.includes('Failed to fetch') ||
    err.message.includes('NetworkError') ||
    err.message.includes('timeout')
  ));

class bqo_api {
  // ── Mock mode check ──────────────────────────────────────────────────────
  static _useMock() {
    return getAppConfig().use_mock_bqo === true;
  }

  // ── Generic fetch dengan fallback ke server cadangan ─────────────────────
  /**
   * _fetchWithFallback — coba fetch ke URL utama, jika gagal (network) coba ke cadangan.
   * @param {string} primaryUrl - URL endpoint utama
   * @param {string} fallbackUrl - URL endpoint cadangan (opsional)
   * @param {object} options - fetch options (method, headers, body, signal)
   * @returns {object} response JSON
   */
  static async _fetchWithFallback(primaryUrl, fallbackUrl, options) {
    try {
      const res = await fetch(primaryUrl, options);
      return await res.json();
    } catch (primaryErr) {
      // Jika server cadangan tidak dikonfigurasi, langsung return error
      if (!fallbackUrl) return primaryErr;

      // Coba ke server cadangan
      try {
        const res = await fetch(fallbackUrl, {
          ...options,
          signal: AbortSignal.timeout(15000), // timeout baru untuk cadangan
        });
        const json = await res.json();
        return { ...json, _source: 'fallback' };
      } catch (fallbackErr) {
        // Kedua server gagal — return error utama
        return primaryErr;
      }
    }
  }

  // ── fetch ke BQO_X (transaksi pesanan) ───────────────────────────────────
  static async fetching(action, data) {
    if (this._useMock()) {
      try { return await bqo_mock.handle(action, data); }
      catch (error) { return error; }
    }

    const body = JSON.stringify({ action, ...data }, null, 2);
    const headers = {
      'content-type': 'application/json',
      secretkey: Config.SESSION_KEY(),
      sessionid: Config.SESSION_ID(),
    };

    const primaryUrl  = ApiRoute.BQO_X;
    const fallbackUrl = LOCAL_BASE_URL ? `${LOCAL_BASE_URL}/csa/resto/bqo_x` : '';

    return this._fetchWithFallback(primaryUrl, fallbackUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(15000),
    });
  }

  // ── fetch ke BSTOCK_X (katalog menu) ─────────────────────────────────────
  static async fetchStock(action, data) {
    if (this._useMock()) {
      try { return await bqo_mock.handle(action, data); }
      catch (error) { return error; }
    }

    const body = JSON.stringify({ action, ...data }, null, 2);
    const headers = {
      'content-type': 'application/json',
      secretkey: Config.SESSION_KEY(),
      sessionid: Config.SESSION_ID(),
    };

    const primaryUrl  = ApiRoute.BSTOCK_X;
    const fallbackUrl = LOCAL_BASE_URL ? `${LOCAL_BASE_URL}/csa/resto/bstock_x` : '';

    return this._fetchWithFallback(primaryUrl, fallbackUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(15000),
    });
  }

  /**
   * getList — ambil katalog menu dari bstock_x.
   * Supports pagination: pass { offset, limit } di data untuk override.
   */
  static getList(data) {
    return this.fetchStock('getlist', {
      offset:     0,
      limit:      30,
      usebrwdef:  Config.USE_BRWDEF,
      listfields: MENU_LISTFIELDS,
      query: {
        freefilter: { search: '!LDISCONT' },
        textfilter: { search: '' },
      },
      getimage: MENU_GETIMAGE,
      ...data,
    });
  }

  /**
   * getListTotal — ambil total record yang tersedia (limit=0 → hanya metadata).
   */
  static getListTotal(data) {
    return this.fetchStock('getlist', {
      offset:     0,
      limit:      0,
      usebrwdef:  Config.USE_BRWDEF,
      listfields: ['cstocode'],
      query: {
        freefilter: { search: '!LDISCONT' },
        textfilter: { search: '' },
      },
      getimage: false,
      ...data,
    });
  }

  /**
   * getActiveOrders — ambil daftar order aktif hari ini.
   */
  static getActiveOrders() {
    return this.fetching('getlist', {
      offset:     0,
      limit:      999,
      usebrwdef:  Config.USE_BRWDEF,
      listfields: ['cqonum', 'ctabid', 'cstatus', 'dqodate'],
      query: {
        freefilter: { search: 'dqodate >= date()' },
        textfilter: { search: '' },
      },
    });
  }

  /**
   * add — simpan pesanan ke bqo_x.
   */
  static add(data) {
    return this.fetching('add', data);
  }

  /**
   * addToLocal — kirim transaksi ke server cadangan (legacy method).
   * Untuk backward compatibility dengan bqo_payment.js yang sudah pakai ini.
   */
  static async addToLocal(data) {
    if (!LOCAL_BASE_URL) {
      throw new Error('Server cadangan tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
    }

    const localUser = window.localStorage.getItem('auth_local_user');
    const localPass = window.localStorage.getItem('auth_local_pass');

    if (!localUser || !localPass) {
      throw new Error('Credential fallback tidak tersedia. Silakan login ulang.');
    }

    // Login ke server cadangan
    const loginRes = await fetch(`${LOCAL_BASE_URL}/csa/resto/login_x`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user': localUser,
        'x-password': localPass,
      },
      body: JSON.stringify({ action: 'login' }),
      signal: AbortSignal.timeout(10000),
    });

    const localSessionKey = loginRes.headers.get('secretkey');
    const localSessionID  = loginRes.headers.get('sessionid');
    const loginJson       = await loginRes.json();

    if (!loginJson.result) {
      throw new Error('Login ke server cadangan gagal: ' + (loginJson.onfail?.cerror || 'Unknown error'));
    }

    // Kirim transaksi ke server cadangan
    const res = await fetch(`${LOCAL_BASE_URL}/csa/resto/bqo_x`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        secretkey: localSessionKey,
        sessionid: localSessionID,
      },
      body: JSON.stringify({ action: 'add', ...data }, null, 2),
      signal: AbortSignal.timeout(15000),
    });

    // Logout dari server cadangan
    try {
      await fetch(`${LOCAL_BASE_URL}/csa/resto/login_x`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-user': localUser,
          secretkey: localSessionKey,
          sessionid: localSessionID,
        },
        body: JSON.stringify({ action: 'logout' }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (_) { /* silent */ }

    const json = await res.json();
    return { ...json, source: 'local' };
  }
}

export default bqo_api;
