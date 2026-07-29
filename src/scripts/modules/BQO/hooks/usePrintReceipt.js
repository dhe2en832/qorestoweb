/**
 * usePrintReceipt.js
 *
 * Hook untuk print struk restoran (thermal 80mm).
 * Menggunakan window.print() dengan inline style — tidak butuh library tambahan
 * agar tidak bergantung jaringan saat server mati.
 */

import { useRef, useState, useCallback } from 'react';

export default function usePrintReceipt({ callbackAfterPrint } = {}) {
  const printComponentRef = useRef();
  const [printCount, setPrintCount] = useState(0);

  const handlePrint = useCallback(() => {
    const content = printComponentRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      alert('Pop-up diblokir browser. Izinkan pop-up untuk mencetak struk.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Struk</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { box-sizing: border-box; padding: 0; margin: 0; color: black; }
            body { font-family: monospace; font-size: 10px; width: 80mm; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Tunggu load selesai lalu print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
      setPrintCount((prev) => prev + 1);
      if (callbackAfterPrint) {
        Promise.resolve().then(() => callbackAfterPrint()).catch(() => {});
      }
    };
  }, [callbackAfterPrint]);

  return { printComponentRef, handlePrint, printCount };
}
