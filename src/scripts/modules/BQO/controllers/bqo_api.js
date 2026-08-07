import Config from '../../../Config';
import ApiRoute from '../../../routes/ApiRoute';
import bqo_mock from './bqo_mock';
import { getAppConfig } from '../../../utils/app-config';

// URL server lokal sebagai fallback. Kosong = fitur lokal tidak aktif.
const LOCAL_BASE_URL = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();

// Field minimal yang diambil dari bstock_x untuk katalog menu
const MENU_LISTFIELDS = [
  'cstocode', 'cstoname', 'cstoname2', 'nhrgjua', 'ndisc',
  'cfamcode', 'cprocod', 'csatuan', 'cnotes1',
];

// Kontrol dari env — bisa di-set per environment tanpa rebuild bqo_api
const MENU_USE_BRWDEF = process.env.REACT_APP_MENU_USE_BRWDEF === 'Y';
const MENU_GETIMAGE   = process.env.REACT_APP_MENU_GETIMAGE   === 'Y';

class bqo_api {
  // ── Mock mode check ──────────────────────────────────────────────────────
  static _useMock() {
    return getAppConfig().use_mock_bqo === true;
  }

  // ── fetch ke BQO_X (transaksi pesanan) ───────────────────────────────────
  static async fetching(action, data) {
    if (this._useMock()) {
      try { return await bqo_mock.handle(action, data); }
      catch (error) { return error; }
    }
    try {
      const res = await fetch(ApiRoute.BQO_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          secretkey: Config.SESSION_KEY(),
          sessionid: Config.SESSION_ID(),
        },
        body: JSON.stringify({ action, ...data }, null, 2),
        signal: AbortSignal.timeout(15000),
      });
      return await res.json();
    } catch (error) { return error; }
  }

  // ── fetch ke BSTOCK_X (katalog menu) ─────────────────────────────────────
  static async fetchStock(action, data) {
    if (this._useMock()) {
      try { return await bqo_mock.handle(action, data); }
      catch (error) { return error; }
    }
    try {
      const res = await fetch(ApiRoute.BSTOCK_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          secretkey: Config.SESSION_KEY(),
          sessionid: Config.SESSION_ID(),
        },
        body: JSON.stringify({ action, ...data }, null, 2),
        signal: AbortSignal.timeout(15000),
      });
      return await res.json();
    } catch (error) { return error; }
  }

  /**
   * getList — ambil katalog menu dari bstock_x.
   * usebrwdef dan getimage dikontrol via env:
   *   REACT_APP_MENU_USE_BRWDEF: Y/N
   *   REACT_APP_MENU_GETIMAGE:   Y/N
   */
  static getList(data) {
    return this.fetchStock('getlist', {
      offset:     0,
      limit:      999,
      usebrwdef:  MENU_USE_BRWDEF,
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
   * getListBrwdef — alias dengan usebrwdef:true paksa.
   * Dipakai jika ingin eksplisit pakai brwdef terlepas dari env.
   */
  static getListBrwdef(data) {
    return this.fetchStock('getlist', {
      offset:     0,
      limit:      999,
      usebrwdef:  true,
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
   * getActiveOrders — ambil list pesanan aktif dari bqo_x.
   * Dipakai untuk cek meja mana yang sudah terisi (ctabid occupied).
   * Hanya ambil field minimal: cqonum, ctabid, cstatus.
   */
  static getActiveOrders() {
    return this.fetching('getlist', {
      offset:     0,
      limit:      999,
      usebrwdef:  false,
      listfields: ['cqonum', 'ctabid', 'cstatus', 'cremark'],
      query: {
        freefilter: { search: '' },
        textfilter: { search: '' },
      },
    });
  }

  /**
   * add — simpan pesanan ke bqo_x.
   * Payload mengikuti pola trenly bjual_x add:
   *   headerInfo: info pesanan (meja, nama, telepon, tanggal, dll)
   *   lineItemsInfo: detail item (cstocode, cstoname, cuom, nqjual, nhrgjua, namtjua, ndisc, nrpdisc)
   *   paymentInfo: { cbnkid, namount }
   */
  static add(data) {
    return this.fetching('add', data);
  }

  /**
   * addToLocal — kirim transaksi ke server lokal sebagai fallback.
   * Dipanggil saat server utama tidak bisa dijangkau.
   *
   * Mekanisme: auto-login ke server lokal dengan credential dari localStorage,
   * kirim transaksi, lalu auto-logout.
   */
  static async addToLocal(data) {
    if (!LOCAL_BASE_URL) {
      throw new Error('Server lokal tidak dikonfigurasi (REACT_APP_API_LOCAL_ENDPOINT kosong).');
    }

    const localUser = window.localStorage.getItem('auth_local_user');
    const localPass = window.localStorage.getItem('auth_local_pass');

    if (!localUser || !localPass) {
      throw new Error('Credential fallback tidak tersedia. Silakan login ulang.');
    }

    // Login ke server lokal
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
      throw new Error('Login ke server lokal gagal: ' + (loginJson.onfail?.cerror || 'Unknown error'));
    }

    // Safety net — bersihkan jika terjadi crash sebelum logout
    window.sessionStorage.setItem('local_stale_secretkey', localSessionKey);
    window.sessionStorage.setItem('local_stale_sessionid', localSessionID);
    window.sessionStorage.setItem('local_stale_userid',    localUser);

    // Kirim transaksi ke server lokal
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

    // Logout dari server lokal
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

    // Bersihkan safety net
    window.sessionStorage.removeItem('local_stale_secretkey');
    window.sessionStorage.removeItem('local_stale_sessionid');
    window.sessionStorage.removeItem('local_stale_userid');

    const json = await res.json();
    return { ...json, source: 'local' };
  }
}

export default bqo_api;
