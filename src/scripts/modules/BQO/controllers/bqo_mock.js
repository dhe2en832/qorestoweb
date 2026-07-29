/**
 * bqo_mock.js
 *
 * Dummy/mock handler untuk bqo_x backend.
 * Aktif ketika REACT_APP_USE_MOCK_BQO=Y di .env-cmdrc.
 *
 * Mensimulasikan semua action yang dipakai frontend:
 *   - getList  → kembalikan daftar menu dummy
 *   - add      → simulasi simpan order, kembalikan nomor bon
 *
 * Cara mengontrol perilaku mock via localStorage (di DevTools browser):
 *   localStorage.setItem('mock_bqo_delay', '1500')   → delay response (ms)
 *   localStorage.setItem('mock_bqo_fail', 'network') → simulasi network error
 *   localStorage.setItem('mock_bqo_fail', 'backend') → simulasi backend reject
 *   localStorage.removeItem('mock_bqo_fail')         → kembali normal
 */

// ── Data menu dummy ──────────────────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 'all',       label: 'Semua' },
  { id: 'promos',    label: '🏷️ Promo' },
  { id: 'makanan',   label: '🍽️ Makanan' },
  { id: 'minuman',   label: '🥤 Minuman' },
  { id: 'snack',     label: '🍟 Snack' },
  { id: 'dessert',   label: '🍨 Dessert' },
];

const MOCK_MENU = [
  {
    id: 'M001', name: 'Nasi Goreng Spesial', desc: 'Nasi goreng dengan telur, ayam & sayuran',
    price: '30000', sellPrice: '25000', category: 'makanan',
    picture: 'https://placehold.co/300x200/f5a623/white?text=Nasi+Goreng',
  },
  {
    id: 'M002', name: 'Mie Ayam Bakso', desc: 'Mie ayam dengan bakso sapi pilihan',
    price: '22000', sellPrice: '22000', category: 'makanan',
    picture: 'https://placehold.co/300x200/e8854a/white?text=Mie+Ayam',
  },
  {
    id: 'M003', name: 'Ayam Bakar', desc: 'Ayam bakar bumbu kecap, sambal lalapan',
    price: '35000', sellPrice: '35000', category: 'makanan',
    picture: 'https://placehold.co/300x200/c0392b/white?text=Ayam+Bakar',
  },
  {
    id: 'M004', name: 'Soto Ayam', desc: 'Soto bening kuah bening dengan suwiran ayam',
    price: '20000', sellPrice: '18000', category: 'makanan',
    picture: 'https://placehold.co/300x200/f39c12/white?text=Soto+Ayam',
  },
  {
    id: 'M005', name: 'Es Teh Manis', desc: 'Teh manis segar dengan es batu',
    price: '8000', sellPrice: '8000', category: 'minuman',
    picture: 'https://placehold.co/300x200/27ae60/white?text=Es+Teh',
  },
  {
    id: 'M006', name: 'Es Jeruk', desc: 'Jeruk peras segar, menyegarkan',
    price: '12000', sellPrice: '12000', category: 'minuman',
    picture: 'https://placehold.co/300x200/e67e22/white?text=Es+Jeruk',
  },
  {
    id: 'M007', name: 'Jus Alpukat', desc: 'Jus alpukat segar dengan susu',
    price: '18000', sellPrice: '15000', category: 'minuman',
    picture: 'https://placehold.co/300x200/2ecc71/white?text=Jus+Alpukat',
  },
  {
    id: 'M008', name: 'Kopi Hitam', desc: 'Kopi tubruk lokal, tanpa gula',
    price: '10000', sellPrice: '10000', category: 'minuman',
    picture: 'https://placehold.co/300x200/5d4037/white?text=Kopi+Hitam',
  },
  {
    id: 'M009', name: 'Kentang Goreng', desc: 'Kentang goreng renyah, saus sambal & tomat',
    price: '15000', sellPrice: '12000', category: 'snack',
    picture: 'https://placehold.co/300x200/f1c40f/white?text=Kentang',
  },
  {
    id: 'M010', name: 'Pisang Goreng', desc: 'Pisang kepok goreng, cocok untuk teman kopi',
    price: '10000', sellPrice: '10000', category: 'snack',
    picture: 'https://placehold.co/300x200/f39c12/white?text=Pisang+Goreng',
  },
  {
    id: 'M011', name: 'Es Krim Vanilla', desc: 'Es krim vanilla lembut, topping cokelat',
    price: '18000', sellPrice: '18000', category: 'dessert',
    picture: 'https://placehold.co/300x200/85c1e9/white?text=Es+Krim',
  },
  {
    id: 'M012', name: 'Pudding Cokelat', desc: 'Pudding cokelat dengan saus karamel',
    price: '12000', sellPrice: '10000', category: 'dessert',
    picture: 'https://placehold.co/300x200/7d3c98/white?text=Pudding',
  },
];

// ── Counter nomor bon ─────────────────────────────────────────────────────────
let _orderCounter = parseInt(window.sessionStorage.getItem('mock_order_counter') || '0', 10);
const nextOrderNum = () => {
  _orderCounter++;
  window.sessionStorage.setItem('mock_order_counter', String(_orderCounter));
  const pad = (n, len) => String(n).padStart(len, '0');
  const now = new Date();
  return `MOCK-${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}-${pad(_orderCounter, 4)}`;
};

// ── Helper: baca kontrol dari localStorage ────────────────────────────────────
const getMockDelay = () => parseInt(window.localStorage.getItem('mock_bqo_delay') || '400', 10);
const getMockFail  = () => (window.localStorage.getItem('mock_bqo_fail') || '').trim();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock handler utama ────────────────────────────────────────────────────────
const bqo_mock = {

  async handle(action, data) {
    await delay(getMockDelay());

    const failMode = getMockFail();

    // Simulasi network error
    if (failMode === 'network') {
      throw new TypeError('Failed to fetch');
    }

    // Simulasi backend reject
    if (failMode === 'backend') {
      return {
        result: false,
        onfail: { cerror: '[MOCK] Backend menolak: stok habis atau data tidak valid.' },
      };
    }

    switch (action) {

      // ── getList ──────────────────────────────────────────────────────────
      case 'getList':
      case 'getlist': {
        console.log('[BQO MOCK] getList called', data);
        return {
          result: true,
          datas: MOCK_MENU,
          categories: MOCK_CATEGORIES,
        };
      }

      // ── add ───────────────────────────────────────────────────────────────
      case 'add': {
        const bon = nextOrderNum();
        console.log('[BQO MOCK] add called', { bon, data });
        console.table(
          (data.cart || []).map((item) => ({
            nama:  item.item?.name,
            qty:   item.qty,
            harga: item.item?.sellPrice,
            note:  item.note || '-',
          }))
        );
        return {
          result: true,
          onsuccess: {
            cordernum: bon,
            cmeja:     data.info?.seatNumber  || '-',
            cnama:     data.info?.orderByName || '-',
          },
        };
      }

      // ── action tidak dikenal ──────────────────────────────────────────────
      default: {
        console.warn('[BQO MOCK] Unknown action:', action);
        return {
          result: false,
          onfail: { cerror: `[MOCK] Action '${action}' tidak dikenali.` },
        };
      }
    }
  },
};

export default bqo_mock;
