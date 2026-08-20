# Server-Side Pagination — Katalog Menu Qorestoweb

## Ringkasan

Katalog menu menggunakan server-side pagination untuk mengatasi performa saat database memiliki ribuan item (1891+ record). Hanya 30 item yang di-fetch per halaman, sisanya dimuat on-demand saat user klik "Muat Lebih Banyak".

---

## API Backend (`bstock_x`)

### Endpoint
```
POST http://{SERVER_IP}/api/csa/resto/bstock_x
```

### Parameter Pagination
| Parameter | Tipe | Fungsi |
|-----------|------|--------|
| `offset` | number | Jumlah record yang di-skip (bukan page number) |
| `limit` | number | Jumlah record per halaman. `0` = hanya return metadata |

### Response Metadata
```json
{
  "metadata": {
    "offset": 0,
    "limit": 30,
    "count": 30,
    "total": 1891   // hanya muncul saat limit=0
  }
}
```

| Field | Fungsi |
|-------|--------|
| `offset` | Offset yang digunakan di request |
| `limit` | Limit yang digunakan di request |
| `count` | Jumlah record yang dikembalikan di response ini |
| `total` | Total record yang tersedia (hanya saat `limit=0`) |

---

## Pola Penggunaan

### 1. Ambil Total Record
```json
{ "action": "getlist", "offset": 0, "limit": 0, "listfields": ["cstocode"], ... }
```
Response: `metadata.total = 1891`, `data = []` (kosong)

### 2. Ambil Halaman 1 (30 item pertama)
```json
{ "action": "getlist", "offset": 0, "limit": 30, ... }
```
Response: 30 item, `metadata.count = 30`

### 3. Ambil Halaman 2 (item 31-60)
```json
{ "action": "getlist", "offset": 30, "limit": 30, ... }
```
Response: 30 item berikutnya

### 4. Halaman Terakhir
```json
{ "action": "getlist", "offset": 1860, "limit": 30, ... }
```
Response: 31 item (sisa), `metadata.count = 31`

---

## Implementasi di Frontend

### File Terlibat
- `bqo_api.js` — method `getList()` dan `getListTotal()`
- `bqo_home.js` — state management dan render

### State Pagination
```js
const PAGE_SIZE = 30;
const [totalItems, setTotalItems] = useState(0);    // total dari server
const [currentOffset, setCurrentOffset] = useState(0); // offset terakhir yang di-fetch
const [isLoadingMore, setIsLoadingMore] = useState(false);
const hasMore = lists.length < totalItems;
```

### Flow Saat Mount
```
1. getListTotal() → total = 1891
2. getList({ offset: 0, limit: 30 }) → 30 item
3. Render 30 item + tombol "Muat Lebih Banyak (1861 item lagi)"
```

### Flow Load More
```
1. User klik "Muat Lebih Banyak"
2. getList({ offset: 30, limit: 30 }) → 30 item
3. Append ke lists → total 60 item di layar
4. Update offset = 30
5. Tombol: "Muat Lebih Banyak (1831 item lagi)"
```

### Flow Filter Kategori
```
1. User klik tab kategori (misal "HE")
2. getList({ offset: 0, limit: 9999 }) → semua item
3. Filter client-side: hanya item dengan category === "HE"
4. Tampilkan hasil filter (tanpa pagination)
```

### Flow Search
```
1. User ketik keyword (debounce 500ms)
2. getList({ textfilter: keyword, offset: 0, limit: 9999 })
3. Filter client-side tambahan (case-insensitive)
4. Tampilkan hasil (tanpa pagination)
```

### Flow Reset (kembali ke "Semua")
```
1. User klik tab "Semua" atau kosongkan search
2. getListTotal() → total
3. getList({ offset: 0, limit: 30 }) → page 1
4. Kembali ke mode pagination
```

---

## Method di `bqo_api.js`

### `getList(data)`
Fetch menu dengan pagination. Default `offset=0, limit=30`.
```js
bqo_api.getList({ offset: 60, limit: 30 })
```

### `getListTotal(data)`
Fetch total record tanpa data (limit=0). Ringan dan cepat.
```js
bqo_api.getListTotal()
// → response.metadata.total = 1891
```

---

## Catatan

- `offset` = jumlah record yang di-skip (BUKAN page number)
- Halaman 1 = offset 0, halaman 2 = offset 30, dst.
- Filter kategori dan search **tidak pakai pagination** — fetch semua lalu filter client-side. Ini karena backend `bstock_x` tidak support filter by `cfamcode` di level query.
- Saat kembali ke tab "Semua", pagination di-reset ke page 1.
- Load more **append** data ke list yang sudah ada (bukan replace).
