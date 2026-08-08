import React, { forwardRef } from 'react';
import { toCurrencyIDR } from '../../../utils/formatter';

/**
 * BQOReceipt — Komponen struk restoran untuk cetak (thermal 80mm).
 *
 * Props:
 *   datas.cart            - array item pesanan { item, qty, note? }
 *   datas.orderInfo       - { seatNumber, orderByName, phoneNumber }
 *   datas.subtotal        - number (sebelum pajak)
 *   datas.taxAmount       - number
 *   datas.total           - number (grand total)
 *   datas.paymentMethod   - string (nama metode bayar)
 *   datas.nomorBon        - string (nomor bon dari backend, atau externalId)
 *   datas.cqonum          - string (nomor QO dari backend, misal "2608000022")
 *   datas.isLocalServer   - bool (true = cetak dari server cadangan)
 *   datas.showArchiveCopy - bool (true = tampilkan salinan arsip)
 *   datas.isUnrecorded    - bool (true = watermark BELUM TEREKAM)
 */
const BQOReceipt = forwardRef(function BQOReceipt({ datas = {} }, ref) {
  const {
    cart = [],
    orderInfo = {},
    subtotal = 0,
    taxAmount = 0,
    total = 0,
    paymentMethod = '-',
    nomorBon = '',
    cqonum = '',
    isLocalServer = false,
    showArchiveCopy = false,
    isUnrecorded = false,
  } = datas;

  const now     = new Date();
  const pad     = (n) => String(n).padStart(2, '0');
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const ReceiptBody = () => (
    <div style={styles.wrapper}>
      {/* Header toko */}
      <div style={styles.center}>
        <div style={styles.storeName}>QORESTO</div>
        {isLocalServer && (
          <div style={styles.serverBadge}>[ SERVER CADANGAN ]</div>
        )}
        {isUnrecorded && (
          <div style={styles.unrecorded}>⚠ BELUM TEREKAM DI SERVER</div>
        )}
      </div>

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Info pesanan */}
      <div style={styles.row}>
        <span>No. Bon</span>
        <span>{nomorBon || '-'}</span>
      </div>
      {cqonum && (
        <div style={styles.row}>
          <span>No. Order</span>
          <span>{cqonum}</span>
        </div>
      )}
      <div style={styles.row}>
        <span>Tanggal</span>
        <span>{dateStr} {timeStr}</span>
      </div>
      <div style={styles.row}>
        <span>Meja</span>
        <span>{orderInfo.seatNumber || '-'}</span>
      </div>
      <div style={styles.row}>
        <span>Pemesan</span>
        <span>{orderInfo.orderByName || '-'}</span>
      </div>
      {orderInfo.phoneNumber && (
        <div style={styles.row}>
          <span>No. Telp</span>
          <span>{orderInfo.phoneNumber}</span>
        </div>
      )}

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Item pesanan */}
      {cart.map((data, idx) => {
        const price = parseFloat(data.item?.sellPrice || 0);
        const qty   = parseInt(data.qty || 1);
        return (
          <div key={idx} style={styles.itemBlock}>
            <div style={styles.itemName}>{data.item?.name || '-'}</div>
            {data.note && (
              <div style={styles.itemNote}>  ↳ {data.note}</div>
            )}
            <div style={styles.row}>
              <span>  {qty} x Rp {toCurrencyIDR(price)}</span>
              <span>Rp {toCurrencyIDR(price * qty)}</span>
            </div>
          </div>
        );
      })}

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Ringkasan biaya */}
      <div style={styles.row}>
        <span>Subtotal</span>
        <span>Rp {toCurrencyIDR(subtotal)}</span>
      </div>
      <div style={styles.row}>
        <span>Pajak (11%)</span>
        <span>Rp {toCurrencyIDR(taxAmount)}</span>
      </div>
      <div style={{ ...styles.row, ...styles.totalRow }}>
        <span>TOTAL</span>
        <span>Rp {toCurrencyIDR(total)}</span>
      </div>

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Metode bayar */}
      <div style={styles.row}>
        <span>Pembayaran</span>
        <span>{paymentMethod}</span>
      </div>

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Footer */}
      <div style={styles.center}>
        <div>Terima kasih atas kunjungan Anda!</div>
        <div style={styles.footerSmall}>Powered by CSA Computer</div>
        {showArchiveCopy && (
          <div style={styles.archiveBadge}>[ SALINAN ARSIP ]</div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={ref}>
      <ReceiptBody />
      {/* Salinan arsip saat disimpan ke server lokal */}
      {showArchiveCopy && (
        <>
          <div style={styles.pageCut}>{'- - - - - - - - - - - - - - - -'}</div>
          <ReceiptBody />
        </>
      )}
    </div>
  );
});

const styles = {
  wrapper: {
    width: '72mm',
    fontFamily: 'monospace',
    fontSize: '10px',
    padding: '4px 4px',
    color: '#000',
  },
  center: {
    textAlign: 'center',
    marginBottom: '4px',
  },
  storeName: {
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '2px',
  },
  serverBadge: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#555',
    marginTop: '2px',
  },
  unrecorded: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#000',
    border: '1px solid #000',
    padding: '2px 4px',
    marginTop: '4px',
    display: 'inline-block',
  },
  divider: {
    fontSize: '9px',
    margin: '4px 0',
    letterSpacing: '1px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px',
    fontSize: '10px',
  },
  totalRow: {
    fontWeight: 'bold',
    fontSize: '11px',
    marginTop: '2px',
  },
  itemBlock: {
    marginBottom: '4px',
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemNote: {
    fontSize: '9px',
    color: '#555',
    fontStyle: 'italic',
  },
  footerSmall: {
    fontSize: '9px',
    color: '#777',
    marginTop: '4px',
  },
  archiveBadge: {
    fontSize: '9px',
    fontWeight: 'bold',
    marginTop: '4px',
  },
  pageCut: {
    textAlign: 'center',
    fontSize: '9px',
    margin: '8px 0',
  },
};

export default BQOReceipt;
