import Config from '../../../Config';
import ApiRoute from '../../../routes/ApiRoute';

// URL server lokal sebagai fallback. Kosong = fitur lokal tidak aktif.
const LOCAL_BASE_URL = (process.env.REACT_APP_API_LOCAL_ENDPOINT || '').trim();

class bqo_api {
  static async fetching(action, data) {
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
      const resJson = await res.json();
      return resJson;
    } catch (error) {
      return error;
    }
  }

  static getList(data) {
    return this.fetching('getList', data);
  }

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
