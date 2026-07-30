import React, { forwardRef } from 'react';
import { toCurrencyIDR } from '../../../utils/formatter';

/**
 * BQOOrderSlip — Tanda Terima Pesanan (bukan struk pembayaran).
 * Dicetak saat konsumen memilih "Bayar di Kasir".
 *
 * Fungsi: bukti pesanan sudah masuk ke dapur / kasir.
 * Status pembayaran: BELUM DIBAYAR — konsumen membawa ini ke kasir.
 *
 * Props:
 *   datas.orderInfo   - { seatNumber, orderByName, phoneNumber }
 *   datas.cart        - array item pesanan { item, qty, note? }
 *   datas.subtotal    - number (sebelum pajak)
 *   datas.taxAmount   - number
 *   datas.total       - number (grand total tagihan)
 *   datas.nomorPesanan - string (nomor pesanan dari backend)
 */
const BQOOrderSlip = forwardRef(function BQOOrderSlip({ datas = {} }, ref) {
  const {
    orderInfo   = {},
    cart        = [],
    subtotal    = 0,
    taxAmount   = 0,
    total       = 0,
    nomorPesanan = '',
  } = datas;

  const now     = new Date();
  const pad     = (n) => String(n).padStart(2, '0');
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <div ref={ref} style={styles.wrapper}>

      {/* Header */}
      <div style={styles.center}>
        <div style={styles.title}>TANDA PESANAN</div>
        <div style={styles.subtitle}>Bawa ke kasir untuk pembayaran</div>
      </div>

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Info pesanan */}
      {nomorPesanan && (
        <div style={styles.row}>
          <span>No. Pesanan</span>
          <span><b>{nomorPesanan}</b></span>
        </div>
      )}
      <div style={styles.row}>
        <span>Tanggal</span>
        <span>{dateStr} {timeStr}</span>
      </div>
      <div style={styles.row}>
        <span>No. Meja</span>
        <span><b>{orderInfo.seatNumber || '-'}</b></span>
      </div>
      <div style={styles.row}>
        <span>Nama</span>
        <span>{orderInfo.orderByName || '-'}</span>
      </div>

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Item pesanan */}
      <div style={styles.sectionLabel}>ITEM PESANAN</div>
      {cart.map((data, idx) => {
        const price = parseFloat(data.item?.sellPrice || 0);
        const qty   = parseInt(data.qty || 1);
        return (
          <div key={idx} style={styles.itemBlock}>
            <div style={styles.itemName}>{data.item?.name || '-'}</div>
            {data.note && (
              <div style={styles.itemNote}>  ↳ Catatan: {data.note}</div>
            )}
            <div style={styles.row}>
              <span>  {qty} x Rp {toCurrencyIDR(price)}</span>
              <span>Rp {toCurrencyIDR(price * qty)}</span>
            </div>
          </div>
        );
      })}

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Ringkasan tagihan */}
      <div style={styles.row}>
        <span>Subtotal</span>
        <span>Rp {toCurrencyIDR(subtotal)}</span>
      </div>
      <div style={styles.row}>
        <span>Pajak (11%)</span>
        <span>Rp {toCurrencyIDR(taxAmount)}</span>
      </div>
      <div style={{ ...styles.row, ...styles.totalRow }}>
        <span>TOTAL TAGIHAN</span>
        <span>Rp {toCurrencyIDR(total)}</span>
      </div>

      <div style={styles.divider}>{'─'.repeat(32)}</div>

      {/* Status & footer */}
      <div style={styles.statusBox}>
        BELUM DIBAYAR
      </div>
      <div style={styles.center}>
        <div style={styles.footerNote}>
          Tunjukkan tanda ini ke kasir
        </div>
        <div style={styles.footerSmall}>Terima kasih atas pesanan Anda</div>
        <div style={styles.footerSmall}>Powered by CSA Computer</div>
      </div>

    </div>
  );
});

const styles = {
  wrapper: {
    width: '72mm',
    fontFamily: 'monospace',
    fontSize: '10px',
    padding: '4px',
    color: '#000',
  },
  center: {
    textAlign: 'center',
    marginBottom: '4px',
  },
  title: {
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '9px',
    color: '#555',
    marginTop: '2px',
  },
  sectionLabel: {
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginBottom: '2px',
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
  statusBox: {
    border: '2px solid #000',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '11px',
    padding: '3px',
    margin: '6px 0',
    letterSpacing: '2px',
  },
  footerNote: {
    fontSize: '10px',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  footerSmall: {
    fontSize: '9px',
    color: '#777',
    marginTop: '2px',
  },
};

export default BQOOrderSlip;
