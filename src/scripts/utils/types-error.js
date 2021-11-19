export const typesError = {
  SECRET_INVALID: {
    msg: 'Secret Key tidak valid\r\n',
    res: [
      'Secret Key tidak valid',
      <div style={{ textAlign: 'center' }}>
        <p>Silahkan hubungi support CSA Computer!</p>
      </div>,
    ],
  },
  SESSION_INVALID: {
    msg: 'Session Id tidak valid\r\n',
    res: [
      'Session Id Tidak Valid',
      <div style={{ textAlign: 'center' }}>
        <p>Silahkan lakukan login untuk melanjutkan!</p>
      </div>,
    ],
  },
  SESSION_LOCKED: {
    msg: 'Session di-LOCK oleh proses lain\r\n',
    res: 'Session terkunci oleh proses lain,\r\nSilahkan Coba Lagi.',
    func: (cb) => setTimeout(() => { cb && cb(); console.log('waiting 0.5 seconds'); }, 500),
  },
  SESSION_TIMEOUT: {
    msg: 'Session Id telah expired\r\n',
    res: [
      'Masa Aktif Session Telah Habis',
      <div style={{ textAlign: 'center' }}>
        <p>Silahkan lakukan login untuk melanjutkan!</p>
      </div>,
    ],
  },
  SESSION_CLOSED: {
    msg: 'Tidak dapat mengakhiri session\r\n',
    res: 'Session telah ditutup'
  },
  FETCH: { msg: 'Failed to fetch', res: 'Fetch ke Server Gagal atau Server sedang Offline' },
  LOGIN: {
    EMPTY_USER: {
      msg: 'Empty user\r\n',
      res: 'User ID Masih Kosong.',
    },
  },
  ITEMS: {
    EMPTY_ITEM: {
      msg: 'Empty query item (a)\r\n',
      res: 'Items tidak boleh kosong',
    },
    INVALID_ITEM: {
      msg: '::',
      resCode: (data) => data.split('::')[0].toLowerCase(),
      resText: (data) => data.split('::')[1].trim(),
    }
  }
};
