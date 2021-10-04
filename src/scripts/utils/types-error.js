export const typesError = {
  SECRET_KEY: {
    msg: 'Secret Key tidak valid',
    res: [
      'Session Telah Habis',
      <div style={{ textAlign: 'center' }}>
        <p>Silahkan lakukan login untuk melanjutkan!</p>
      </div>,
    ],
  },
  FETCH: { msg: 'Failed to fetch', res: 'Fetch ke Server Gagal atau Server sedang Offline' },
  ITEMS: { msg: 'Empty query item (a)', res: 'Daftar Items Stock masih kosong' },
};
