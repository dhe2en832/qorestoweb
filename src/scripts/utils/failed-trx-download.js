/**
 * failed-trx-download.js
 *
 * Download payload transaksi gagal ke file JSON sebagai failsafe
 * saat kedua server (utama + lokal) tidak bisa dijangkau.
 */

import { useState } from 'react';

export default function useFailedTrxDownload() {
  const [isDownloaded, setIsDownloaded] = useState(false);

  /**
   * Download payload sebagai file JSON.
   * @param {object} payload    - data transaksi lengkap
   * @param {string} errorType  - 'network_error' | 'backend_reject'
   * @param {object} extraMeta  - info tambahan (seatNumber, orderByName, dll)
   */
  const downloadFailedTrx = (payload, errorType = 'unknown', extraMeta = {}) => {
    try {
      const now      = new Date();
      const pad      = (n) => String(n).padStart(2, '0');
      const dateStr  = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
      const timeStr  = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const seat     = extraMeta?.seatNumber || 'UNKN';
      const filename = `FAILTRX_MEJA${seat}_${dateStr}_${timeStr}.json`;

      const content = JSON.stringify(
        {
          _meta: {
            downloadedAt: now.toISOString(),
            errorType,
            note: 'Transaksi BELUM TEREKAM di server. Rekonsiliasi manual diperlukan.',
            ...extraMeta,
          },
          payload,
        },
        null,
        2
      );

      const blob = new Blob([content], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setIsDownloaded(true);
    } catch (err) {
      console.error('Gagal download transaksi:', err);
    }
  };

  const resetDownloadState = () => setIsDownloaded(false);

  return { isDownloaded, downloadFailedTrx, resetDownloadState };
}
