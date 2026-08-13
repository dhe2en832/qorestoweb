import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress'; // eslint-disable-line no-unused-vars
import NoteIcon from '@mui/icons-material/NoteAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TrashIcon from '@mui/icons-material/DeleteOutline';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import CashierIcon from '@mui/icons-material/PointOfSale';
import SelfPayIcon from '@mui/icons-material/PhoneAndroid';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import Placeholder from '../../../../images/placeholder.png';
import useResponsive from '../../../hooks/useResponsive';
import { toCurrencyIDR } from '../../../utils/formatter';
import ToastBar from '../../../components/ToastBar';
import AlertDialog from '../../../components/AlertDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';
import bqo_api from '../controllers/bqo_api';
import usePrintReceipt from '../hooks/usePrintReceipt';
import BQOOrderSlip from '../reports/BQOOrderSlip';
import { getTableId } from '../../../utils/table-session';
import { getAppConfig } from '../../../utils/app-config';
import { useAuth } from '../../../contexts/AuthContext';

/** Deteksi apakah error dari backend adalah session expired/invalid */
const isSessionExpired = (msg) =>
  typeof msg === 'string' &&
  (msg.includes('Session Id telah expired') ||
   msg.includes('Session Id tidak valid') ||
   msg.includes('expired') ||
   msg.includes('di-LOCK') ||
   msg.includes('proses lain'));

// Pajak — BASE_TAX × EFFECTIVE_RATE dari env (pola webcsa-v2)
// Contoh: 12 × (11/12) = 11%
const TAX_BASE = parseFloat(process.env.REACT_APP_TAX_BASE || '12');
const TAX_RATE_STR = (process.env.REACT_APP_TAX_EFFECTIVE_RATE || '11/12').trim();
const TAX_RATE = TAX_RATE_STR.includes('/')
  ? (() => { const [a, b] = TAX_RATE_STR.split('/'); return parseFloat(a) / parseFloat(b); })() // "11/12" → 0.9166...
  : parseFloat(TAX_RATE_STR);
const TAX_PERCENT = TAX_BASE * TAX_RATE; // 12 * (11/12) = 11

// Jumlah meja dari env
const TABLE_COUNT = parseInt(process.env.REACT_APP_TABLE_COUNT || '10', 10);

// Customer ID dan Warehouse ID default — baca langsung dari env
const BQO_DEFAULT_CUSTOMER = (process.env.REACT_APP_BQO_DEFAULT_CUSTOMER || 'UMUM').trim();
const BQO_DEFAULT_WHSE     = (process.env.REACT_APP_BQO_DEFAULT_WHSE     || '').trim();
const BQO_DEFAULT_SALES    = (process.env.REACT_APP_BQO_DEFAULT_SALES    || 'ONLINE').trim();
const BQO_DEFAULT_CPCODE   = (process.env.REACT_APP_BQO_DEFAULT_CPCODE   || 'STD').trim();

// Kode bank per metode pembayaran — harus sama dengan yang dikonfigurasi di master BBANK
const CASH_BANK_CODE = (process.env.REACT_APP_CASH_BANK_CODE || 'T000').trim();
export default function BQOCheckout() {
  const { smUp } = useResponsive();
  const navigate = useNavigate();
  const auth = useAuth();
  const styles = {
    container: {
      background: '#eee',
      paddingTop: smUp ? '25px' : '15px',
      height: '100%',
      paddingBottom: 100,
    },
    appBar: {
      backgroundColor: '#fff',
    },
    appBarIcon: {
      color: '#3f50b5',
    },
    imageList: {
      height: smUp ? '85px' : '75px',
      width: smUp ? '85px' : '75px',
      objectFit: 'cover',
    },
    qtyInput: {
      '& .MuiOutlinedInput-root': {
        padding: 0,
      },
      '& .MuiInputBase-input': {
        padding: '8px',
        width: '4ch',
        margin: 0,
        borderLeft: '1px solid #b7b7b7',
        borderRight: '1px solid #b7b7b7',
        textAlign: 'center',
      },
    },
    adornIcon: {
      cursor: 'pointer',
      color: '#3f50b5',
    },
    trashButton: {
      padding: 0,
      minWidth: '44px',
      mr: 4,
    },
    noteButton: {
      padding: 0,
      minWidth: '44px',
      mr: 2,
    },
    noteForm: {
      '& .MuiInputBase-root': {
        padding: 1,
      },
    },
  };

  // Dialog
  const [showDialog, setShowDialog] = useState({
    isShow: false,
    isForm: false,
    accessorID: '',
  });
  const handleCloseDialog = () => {
    setShowDialog({
      isShow: false,
      isForm: false,
      accessorID: '',
    });
  };
  const handleOpenDialog = (isForm, accessorID) => {
    setShowDialog({
      isShow: true,
      isForm,
      accessorID,
    });
  };

  // Info Order — restore dari localStorage jika ada (setelah re-login dari session expired)
  // seatNumber diisi otomatis dari URL ?table=XX jika tersedia
  const [info, setInfo] = useState(() => {
    const tableFromUrl = getTableId();
    const saved = window.localStorage.getItem('QoOrderInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Override seatNumber dengan nilai dari URL jika ada
        return { ...parsed, seatNumber: tableFromUrl || parsed.seatNumber };
      } catch (_) {}
    }
    return { seatNumber: tableFromUrl, orderByName: '', phoneNumber: '' };
  });

  // Apakah nomor meja dikunci (dari URL parameter)
  const isTableLocked = getTableId() !== '';

  const handleChangeInfo = (event) => {
    setInfo({
      ...info,
      [event.target.name]: event.target.value,
    });
  };

  // Daftar meja: status tersedia / terisi
  // occupiedTables: Set dari ctabid yang sedang ada pesanan aktif
  const [occupiedTables, setOccupiedTables] = useState(new Set());
  const occupiedTablesRef = useRef(new Set()); // ref untuk cek sinkron setelah fetch
  const [loadingTables, setLoadingTables] = useState(false);

  const fetchOccupiedTables = async () => {
    setLoadingTables(true);
    try {
      let res = await bqo_api.getActiveOrders();

      // Jika session expired di QR mode → silent re-login lalu retry
      if (res && res.result === false && getTableId()) {
        const errMsg = res.onfail?.cerror || '';
        if (errMsg.includes('expired') || errMsg.includes('tidak valid') || errMsg.includes('LOCK') || errMsg.includes('proses lain')) {
          await new Promise((resolve) => auth.signinAsGuest(resolve));
          res = await bqo_api.getActiveOrders();
        }
      }

      if (res && res.result && Array.isArray(res.data)) {
        let orders = [];

        if (res.columns && Array.isArray(res.data[0])) {
          // Format brwdef: array of arrays — petakan kolom dulu
          const cols = res.columns;
          const findIdx = (key) => cols.findIndex((c) =>
            (c.key || '').toLowerCase() === key.toLowerCase() ||
            (c.title || '').toLowerCase().includes(key.toLowerCase())
          );
          const idxTabId  = findIdx('ctabid');
          const idxStatus = findIdx('cstatus');
          orders = res.data.map((row) => ({
            ctabid:  String(row[idxTabId  >= 0 ? idxTabId  : 1] || '').trim(),
            cstatus: String(row[idxStatus >= 0 ? idxStatus : 2] || '').trim(),
          }));
        } else {
          // Format non-brwdef: array of objects
          orders = res.data.map((order) => ({
            ctabid:  String(order.ctabid  || '').trim(),
            cstatus: String(order.cstatus || '').trim(),
          }));
        }

        // Normalisasi ctabid: hapus leading zeros agar cocok dengan tableOptions ("1","2",dst.)
        const normalizeTabId = (v) => String(parseInt(v, 10) || '').trim();

        // Meja KOSONG jika statusnya 'C'. Meja TERISI jika statusnya bukan 'C' dan tidak kosong.
        const occupied = new Set(
          orders
            .filter(({ cstatus }) => {
              const s = cstatus.toUpperCase();
              return s !== 'C' && s !== '';
            })
            .map(({ ctabid }) => normalizeTabId(ctabid))
            .filter(Boolean)
        );
        setOccupiedTables(occupied);
        occupiedTablesRef.current = occupied; // update ref sinkron untuk cek race condition
      }
    } catch (_) {
      // Gagal fetch — semua meja dianggap tersedia, tidak blokir
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    fetchOccupiedTables();
    // Refresh saat user kembali ke tab/window ini
    window.addEventListener('focus', fetchOccupiedTables);
    // Polling setiap 15 detik agar data meja selalu sinkron antar device
    const intervalId = setInterval(fetchOccupiedTables, 15000);
    return () => {
      window.removeEventListener('focus', fetchOccupiedTables);
      clearInterval(intervalId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate daftar nomor meja 1..TABLE_COUNT
  const tableOptions = Array.from({ length: TABLE_COUNT }, (_, i) => {
    const num = String(i + 1);
    const isOccupied = occupiedTables.has(num);
    return { value: num, label: `Meja ${num}`, occupied: isOccupied };
  });

  // Cart
  const [cart, setCart] = useState(JSON.parse(window.localStorage.getItem('QoCart')) || {});
  const removeItem = (id) => {
    delete cart[id];
    setCart({ ...cart });
  };
  const increaseQtyItem = (event, data) => {
    event.stopPropagation();
    setCart({
      ...cart,
      [data.id]: {
        item: data,
        qty: cart[data.id].qty + 1,
        ...(cart[data.id].note && { note: cart[data.id].note }),
      },
    });
  };
  const decreaseQtyItem = (event, data) => {
    event.stopPropagation();
    const qtyItem = cart[data.id].qty;
    setCart({
      ...cart,
      [data.id]: {
        item: data,
        qty: qtyItem === 1 ? 1 : qtyItem - 1,
        ...(cart[data.id].note && { note: cart[data.id].note }),
      },
    });
  };
  // const calculateQtyItem = () => {
  //     let totalQty = 0
  //     Object.values(cart).forEach((data) => totalQty = totalQty + data.qty);
  //     return totalQty;
  // }
  const calculatePriceItem = () => {
    let totalPrice = 0;
    Object.values(cart).forEach(
      (data) => (totalPrice = totalPrice + parseFloat(data.item.sellPrice) * data.qty)
    );
    return totalPrice;
  };
  const calculateTaxItem = () => {
    return Math.floor(parseFloat(calculatePriceItem() * (TAX_PERCENT / 100)));
  };
  const changeQtyItem = (event, data) => {
    event.stopPropagation();
    const newValue = event.target.value;
    if (parseInt(newValue) === 0) {
      removeItem(data);
    } else {
      setCart({
        ...cart,
        [data.id]: {
          item: data,
          qty: newValue === '' ? 1 : parseInt(newValue),
          ...(cart[data.id].note && { note: cart[data.id].note }),
        },
      });
    }
  };
  const selectedQtyItem = (event) => {
    event.stopPropagation();
    event.target.select();
  };
  useEffect(() => {
    window.localStorage.setItem('QoCart', JSON.stringify(cart));
    Object.entries(cart).length === 0 && navigate('/menu');
  }, [cart, navigate]);

  // Note Form
  const [noteValue, setNoteValue] = useState('');
  const isNoteExist = (id) => {
    const dataCheck = cart[id].note;
    return dataCheck ? true : false;
  };
  const handleChangeNoteValue = (event) => {
    setNoteValue(event.target.value);
  };
  const handleOpenNoteForm = (accessorID) => {
    isNoteExist(accessorID) && setNoteValue(cart[accessorID].note);
    handleOpenDialog(true, accessorID);
  };
  const handleCloseNoteForm = () => {
    setNoteValue('');
    handleCloseDialog();
  };
  const handleSaveNoteForm = () => {
    if (noteValue !== '') {
      setCart({
        ...cart,
        [showDialog.accessorID]: {
          item: cart[showDialog.accessorID].item,
          qty: cart[showDialog.accessorID].qty,
          note: noteValue,
        },
      });
    } else {
      setCart({
        ...cart,
        [showDialog.accessorID]: {
          item: cart[showDialog.accessorID].item,
          qty: cart[showDialog.accessorID].qty,
        },
      });
    }
    handleCloseNoteForm();
  };

  const showValidation = (title) => {
    ToastBar('error', `${title} Harus Diisi.`);
  };

  // Dialog pilihan metode bayar: kasir vs mandiri
  const [showPaymentMethodDlg, setShowPaymentMethodDlg] = useState(false);

  // Dialog konfirmasi pesanan kasir + struk
  const [kasirResult, setKasirResult] = useState(null); // { nomorBon, cartItems, subtotal, taxAmount, total }
  const { printComponentRef, handlePrint, printCount } = usePrintReceipt();

  const handleOnCheckout = async () => {
    if (info.seatNumber === '') {
      showValidation('Nomor Meja');
      return;
    }
    if (info.orderByName === '') {
      showValidation('Nama Pemesan');
      return;
    }
    // Refresh data meja tepat sebelum submit — cegah race condition antar device
    await fetchOccupiedTables();

    // Normalisasi seatNumber agar cocok dengan format di occupiedTables (tanpa leading zero)
    const normalizedSeat = String(parseInt(info.seatNumber, 10) || info.seatNumber);

    // DEBUG: tampilkan data occupied saat checkout
    if (getAppConfig().debug_screen) {
      const occList = Array.from(occupiedTablesRef.current).join(', ') || '(kosong)';
      ToastBar('info', `DEBUG meja terisi: [${occList}] | seatNumber: "${normalizedSeat}"`, 5000);
    }

    if (occupiedTablesRef.current.has(normalizedSeat)) {
      if (isTableLocked) {
        // QR mode — tampilkan warning tapi tetap bisa lanjut (bisa jadi satu grup)
        ConfirmDialog(
          'Meja ini ada pesanan aktif',
          <p>Pesanan baru akan dibuat terpisah dengan nomor order baru. Lanjutkan?</p>,
          'Ya, Buat Pesanan Baru',
          () => setShowPaymentMethodDlg(true),
        );
        return;
      }
      // Mode manual (dropdown) — blokir total
      ToastBar('error', `Meja ${info.seatNumber} baru saja dipesan orang lain. Pilih meja lain.`, 4000);
      return;
    }
    // Tampilkan dialog pilihan: bayar di kasir atau mandiri
    setShowPaymentMethodDlg(true);
  };

  // Bayar di kasir — submit pesanan ke backend, lalu tampilkan struk
  const [isSubmittingKasir, setIsSubmittingKasir] = useState(false);
  const handlePayAtKasir = async () => {
    setShowPaymentMethodDlg(false);
    setIsSubmittingKasir(true);
    try {
      const cartItems = Object.values(cart);
      const subtotal  = cartItems.reduce((acc, d) => acc + parseFloat(d.item.sellPrice) * d.qty, 0);
      const taxAmount = Math.floor(subtotal * (TAX_PERCENT / 100));
      const total     = subtotal + taxAmount;

      const today   = new Date();
      const pad     = (n) => String(n).padStart(2, '0');
      const dqodate = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
      const ctime   = `${pad(today.getHours())}:${pad(today.getMinutes())}:${pad(today.getSeconds())}`;
      const externalId = String(+today).substring(0, 10); // timestamp 10 char untuk referensi

      // Field sesuai dokumentasi BQO draft.4
      const lineItemsInfo = cartItems.map((d, idx) => {
        const nhrgjua = parseFloat(d.item?.nhrgjua || d.item?.sellPrice || 0);
        const nqqo    = parseInt(d.qty || 1);
        const discPct = parseFloat(d.item?.ndisc || 0);
        const nrpdisc = discPct > 0 ? Math.round(nhrgjua * nqqo * discPct / 100) : 0;
        return {
          nline:    idx + 1,
          cgroup:   '',
          ctime:    '',
          crefnote: '',
          cstocode: (d.item?.cstocode || d.item?.id || '').trim(),
          cstoname: (d.item?.cstoname || d.item?.name || '').trim(),
          csize:    '',
          cloc:     '',
          ncqo:     0,
          nqqo,
          cuom:     (d.item?.csatuan || d.item?.cuom || '').trim(),
          ccpcode:  BQO_DEFAULT_CPCODE,
          csalesid: BQO_DEFAULT_SALES,
          nhrgjua,
          cdisc:    '',
          ndisc:    discPct > 0 ? discPct : 0,
          nrpdisc,
          cremark:  d.note || '',
          cremark2: d.note || '',
        };
      });

      const payload = {
        qoHeaderInfo: {
          dqodate,
          ctime,
          cqonum:    '',
          ctabid:    info.seatNumber  || '',
          cwhseid:   BQO_DEFAULT_WHSE,
          cremark:   info.orderByName || '',
          customer: {
            ccusid:   BQO_DEFAULT_CUSTOMER,
            cinitial: '',
            cnotelp:  info.phoneNumber || '',
            cemail:   '',
          },
          csalesid:  BQO_DEFAULT_SALES,
          lmulsales: false,
          creason:   '-',
          cadjdesc:  '-',
          creason2:  '-',
          cadjdesc2: '-',
          cpaytype:  '',
          cbnkid:    CASH_BANK_CODE,
          ccrdnum:   '',
          nkupon:    0,
          npctdisc:  0,
          npctppn:   TAX_PERCENT,
          namount:   subtotal,
          ndp:       total,
          nsaleschg: 0,
          cqofoot1:  '',
          cqofoot2:  '',
          cqofoot3:  '',
          referensi: {
            crefnum: externalId.substring(0, 10),
            creftrn: externalId.substring(0, 10),
          },
        },
        lineItemsInfo,
        paymentInfo: { cbnkid: CASH_BANK_CODE, namount: total },
      };

      const result = await bqo_api.add(payload);
      if (result.result === true) {
        const bon    = result.onsuccess?.cordernum || result.onsuccess?.csonum || '';
        const cqonum = result.onsuccess?.cqonum    || bon;
        setKasirResult({ nomorBon: bon, cqonum, cartItems, subtotal, taxAmount, total });
        // Refresh daftar meja setelah pesanan berhasil — meja yang baru dipesan langsung terisi
        fetchOccupiedTables();
      } else {
        const errMsg = result.onfail?.cerror || 'Gagal mengirim pesanan.';
        // Deteksi session expired
        if (isSessionExpired(errMsg)) {
          // QR mode: auto re-login lalu retry submit — silent, tanpa pesan ke user
          if (getTableId()) {
            await new Promise((resolve) => auth.signinAsGuest(resolve));
            // Retry submit setelah re-login
            const retryResult = await bqo_api.add(payload);
            if (retryResult.result === true) {
              const bon2    = retryResult.onsuccess?.cordernum || retryResult.onsuccess?.csonum || '';
              const cqonum2 = retryResult.onsuccess?.cqonum    || bon2;
              setKasirResult({ nomorBon: bon2, cqonum: cqonum2, cartItems, subtotal, taxAmount, total });
              fetchOccupiedTables();
            } else {
              ToastBar('error', `Gagal: ${retryResult.onfail?.cerror || 'Error setelah re-login'}`, 5000);
            }
            return;
          }
          // Mode biasa: redirect ke login
          window.localStorage.setItem('QoOrderInfo', JSON.stringify(info));
          window.localStorage.setItem('QoReturnPath', '/checkout');
          ToastBar('warning', 'Session habis. Silakan login kembali — pesanan Anda tersimpan.', 4000);
          setTimeout(() => navigate('/login', { state: { from: { pathname: '/checkout' } } }), 1500);
          return;
        }
        ToastBar('error', `Gagal: ${errMsg}`, 5000);
      }
    } catch (_) {
      ToastBar('error', 'Server tidak bisa dijangkau. Coba lagi.', 5000);
    } finally {
      setIsSubmittingKasir(false);
    }
  };

  // ── Download bukti order sebagai gambar ──────────────────────────────────
  const handleDownloadReceipt = () => {
    if (!kasirResult) return;
    const { cartItems, subtotal, taxAmount, total, nomorBon, cqonum } = kasirResult;
    const noPesanan = cqonum || nomorBon || '-';
    const meja = info.seatNumber || '-';
    const nama = info.orderByName || '-';
    const waktu = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    // Hitung dimensi canvas
    const padding = 24;
    const lineH = 22;
    const headerH = 100;
    const itemH = cartItems.length * lineH;
    const footerH = 120;
    const canvasW = 380;
    const canvasH = headerH + itemH + footerH + padding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW * 2;   // retina
    canvas.height = canvasH * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasW, canvasH);

    let y = padding;

    // Header
    ctx.fillStyle = '#3f50b5';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUKTI PESANAN', canvasW / 2, y + 16);
    y += 30;
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText(`No: ${noPesanan}`, canvasW / 2, y + 12);
    y += 20;
    ctx.fillText(`Meja: ${meja} · ${nama}`, canvasW / 2, y + 12);
    y += 20;
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.fillText(waktu, canvasW / 2, y + 12);
    y += 24;

    // Garis
    ctx.strokeStyle = '#ddd';
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(canvasW - padding, y); ctx.stroke();
    y += 10;

    // Items
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    cartItems.forEach((d) => {
      const itemName = `${d.qty}× ${d.item.name}${d.note ? ' (' + d.note + ')' : ''}`;
      const price = `Rp ${toCurrencyIDR(parseFloat(d.item.sellPrice) * d.qty)}`;
      ctx.fillText(itemName.length > 35 ? itemName.substring(0, 35) + '...' : itemName, padding, y + 14);
      ctx.textAlign = 'right';
      ctx.fillText(price, canvasW - padding, y + 14);
      ctx.textAlign = 'left';
      y += lineH;
    });

    // Garis
    y += 4;
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(canvasW - padding, y); ctx.stroke();
    y += 14;

    // Subtotal, pajak, total
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('Subtotal', padding, y + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${toCurrencyIDR(subtotal)}`, canvasW - padding, y + 12);
    ctx.textAlign = 'left';
    y += lineH;

    ctx.fillText(`Pajak (${TAX_PERCENT}%)`, padding, y + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${toCurrencyIDR(taxAmount)}`, canvasW - padding, y + 12);
    ctx.textAlign = 'left';
    y += lineH + 4;

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('Total', padding, y + 14);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#3f50b5';
    ctx.fillText(`Rp ${toCurrencyIDR(total)}`, canvasW - padding, y + 14);
    y += lineH + 10;

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    ctx.font = '10px sans-serif';
    ctx.fillText('Tunjukkan bukti ini ke kasir saat pembayaran', canvasW / 2, y + 10);

    // Download
    const link = document.createElement('a');
    link.download = `pesanan-${meja}-${noPesanan}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setReceiptDownloaded(true);
  };

  const [receiptDownloaded, setReceiptDownloaded] = useState(false);

  const handleNewOrderAfterKasir = () => {
    const showPrint = getAppConfig().show_print_button !== false; // default true
    // Print guard: cetak dulu (mode PC/kasir)
    if (showPrint && printCount === 0) {
      AlertDialog('warning', 'Belum Cetak Tanda Pesanan',
        'Silakan cetak tanda pesanan terlebih dahulu sebelum membuat pesanan baru.',
        () => handlePrint());
      return;
    }
    // Download guard: wajib download dulu (mode HP/QR)
    if (!showPrint && !receiptDownloaded) {
      AlertDialog('warning', 'Belum Download Bukti Pesanan',
        'Silakan download bukti pesanan terlebih dahulu.',
        () => handleDownloadReceipt());
      return;
    }
    setKasirResult(null);
    setReceiptDownloaded(false);
    window.localStorage.removeItem('QoCart');
    window.localStorage.removeItem('QoOrderInfo');
    navigate('/menu');
  };

  // Bayar mandiri — lanjut ke halaman payment
  const handlePaySelf = () => {
    setShowPaymentMethodDlg(false);
    window.localStorage.setItem('QoOrderInfo', JSON.stringify(info));
    navigate('/payment');
  };

  return (
    <>
      <div style={styles.container}>
        {/* App Bar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <Grid container justifyContent="space-between">
              <Grid item xs={2}>
                <IconButton
                  sx={styles.appBarIcon}
                  onClick={() => {
                    navigate('/menu');
                  }}
                >
                  <BackIcon />
                </IconButton>
              </Grid>
              <Grid item xs={10}>
                <Typography variant="h6" component="h1" color="black" pt={0.5}>
                  Checkout
                </Typography>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        {/* Item Order */}
        <Container
          maxWidth="sm"
          sx={{ mt: 4, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}
        >
          <Grid container py={2} justifyContent="space-between">
            <Grid item>
              <Typography variant="body1" fontWeight={500} component="h2">
                Item Pesanan
              </Typography>
            </Grid>
            <Grid item>
              <Button sx={{ p: 0 }} onClick={() => navigate('/menu')}>
                Tambah Item
              </Button>
            </Grid>
          </Grid>
          {Object.values(cart).map((data) => (
            <Grid
              key={data.item.id + '_chkout'}
              container
              sx={{ px: 1, py: 3, borderTop: '1px solid #ddd' }}
              justifyContent="flex-start"
              spacing={1}
            >
              <Grid item>
                <img
                  src={data.item.picture || Placeholder}
                  style={styles.imageList}
                  alt={data.item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = Placeholder; }}
                />
              </Grid>
              <Grid item xs={7}>
                <Typography variant="body1" component="h2">
                  {data.item.name}
                </Typography>
                {data.note && (
                  <Typography variant="caption" component="h3" color="#a7a7a7">
                    Catatan: {data.note}
                  </Typography>
                )}
                {parseFloat(data.item.sellPrice) < parseFloat(data.item.price) && (
                  <Typography
                    variant={smUp ? 'body1' : 'body2'}
                    fontWeight={500}
                    component="span"
                    color="#787878"
                    mr={0.6}
                    sx={{ textDecoration: 'line-through' }}
                  >
                    Rp {toCurrencyIDR(parseFloat(data.item.price) * parseFloat(data.qty))}
                  </Typography>
                )}
                <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500} component="span">
                  Rp {toCurrencyIDR(parseFloat(data.item.sellPrice) * parseFloat(data.qty))}
                </Typography>
              </Grid>
              <Grid container item xs={12} justifyContent="flex-end" mb={1}>
                <Button
                  variant="outlined"
                  color="error"
                  sx={styles.trashButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(data.item.id);
                  }}
                >
                  <TrashIcon />
                </Button>
                <Button
                  variant="contained"
                  color={isNoteExist(data.item.id) ? 'success' : 'primary'}
                  sx={styles.noteButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenNoteForm(data.item.id);
                  }}
                >
                  {isNoteExist(data.item.id) ? <EditIcon /> : <NoteIcon />}
                </Button>
                <TextField
                  onChange={(event) => changeQtyItem(event, data.item)}
                  onClick={(event) => selectedQtyItem(event)}
                  value={cart[data.item.id].qty}
                  variant="outlined"
                  color="primary"
                  sx={styles.qtyInput}
                  InputProps={{
                    startAdornment: (
                      <IconButton
                        sx={styles.adornIcon}
                        onClick={(event) => decreaseQtyItem(event, data.item)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    ),
                    endAdornment: (
                      <IconButton
                        sx={styles.adornIcon}
                        onClick={(event) => increaseQtyItem(event, data.item)}
                      >
                        <AddIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          ))}
        </Container>
        {/* Info Order */}
        <Container
          maxWidth="sm"
          sx={{ mt: 1, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}
        >
          <Typography variant="body1" fontWeight={500} component="h2" py={2}>
            Informasi Pemesan
          </Typography>
          <Grid container spacing={1} px={1} pb={3} borderTop="1px solid #ddd">
            <Grid item xs={12}>
              {isTableLocked ? (
                /* Meja dari URL — tampilkan read-only, tidak bisa diubah */
                <TextField
                  size="small"
                  variant="standard"
                  label="No. Meja"
                  value={`Meja ${info.seatNumber}`}
                  InputProps={{ readOnly: true, disableUnderline: true }}
                  sx={{ minWidth: 160, '& input': { color: '#555', fontWeight: 500 } }}
                  helperText="Nomor meja sudah ditentukan dari QR/link meja"
                  FormHelperTextProps={{ sx: { color: 'text.secondary', fontStyle: 'italic' } }}
                />
              ) : (
                /* Meja dipilih manual (fallback jika tidak ada ?table= di URL) */
                <TextField
                  select
                  size="small"
                  variant="standard"
                  label={loadingTables ? 'Memuat meja...' : 'No. Meja'}
                  name="seatNumber"
                  value={info.seatNumber}
                  onChange={handleChangeInfo}
                  disabled={loadingTables}
                  SelectProps={{ onOpen: fetchOccupiedTables }}
                  helperText={
                    info.seatNumber && occupiedTables.has(info.seatNumber)
                      ? '⚠️ Meja ini sedang terisi. Pilih meja lain.'
                      : ''
                  }
                  FormHelperTextProps={{ sx: { color: 'warning.main' } }}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="" disabled>
                    <em>— Pilih Nomor Meja —</em>
                  </MenuItem>
                  {tableOptions.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.occupied}
                      sx={opt.occupied ? { color: '#aaa' } : {}}
                    >
                      {opt.label}
                      {opt.occupied ? ' (Terisi)' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                variant="standard"
                label="Nama Pemesan"
                fullWidth
                name="orderByName"
                value={info.orderByName}
                onChange={handleChangeInfo}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                variant="standard"
                label="No. Telp"
                name="phoneNumber"
                value={info.phoneNumber}
                onChange={handleChangeInfo}
              />
            </Grid>
          </Grid>
        </Container>
        {/* Total Order */}
        <Container
          maxWidth="sm"
          sx={{ mt: 1, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}
        >
          <Typography variant="body1" fontWeight={500} component="h2" py={2}>
            Ringkasan Pesanan
          </Typography>
          <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
            <Grid item>
              <Typography variant="body2" component="h2" py={2}>
                Total Belanja
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" fontWeight={500} component="h2" py={2}>
                Rp {toCurrencyIDR(calculatePriceItem())}
              </Typography>
            </Grid>
          </Grid>
          <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
            <Grid item>
              <Typography variant="body2" component="h2" py={2}>
                Pajak ({TAX_PERCENT}%)
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" fontWeight={500} component="h2" py={2}>
                Rp {toCurrencyIDR(calculateTaxItem())}
              </Typography>
            </Grid>
          </Grid>
          <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
            <Grid item>
              <Typography variant="body1" fontWeight={500} component="h2" py={2}>
                Total Pembayaran
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" fontWeight={500} component="h2" color="green" py={2}>
                Rp {toCurrencyIDR(calculatePriceItem() + calculateTaxItem())}
              </Typography>
            </Grid>
          </Grid>
        </Container>
        {/* Submit Button */}
        <Container
          maxWidth="sm"
          sx={{
            mt: 1,
            p: 2,
            bgcolor: '#fff',
            boxShadow: '0px 0px 4px -2px #000',
            textAlign: 'center',
          }}
        >
          <Button
            variant="contained"
            onClick={handleOnCheckout}
            disabled={isSubmittingKasir}
          >
            {isSubmittingKasir ? 'Mengirim...' : 'Lanjutkan Pesanan'}
          </Button>
        </Container>
        {/* Copyright */}
        <Container sx={{ mt: 4 }}>
          <Typography color="#b7b7b7" variant="body1" component="h4" textAlign="center">
            Powered By <b style={{ color: '#3f50b5' }}>CSA Computer</b>
          </Typography>
        </Container>
      </div>
      {/* Note Form */}
      <Dialog
        maxWidth="md"
        key="NoteFormDlg"
        open={showDialog.isShow && showDialog.isForm}
        onClose={handleCloseDialog}
      >
        {showDialog.isShow && (
          <>
            <DialogContent>
              <Typography variant="h6" component="h2" textAlign="center">
                Catatan
              </Typography>
              <TextField
                sx={styles.noteForm}
                multiline
                value={noteValue}
                onChange={handleChangeNoteValue}
                rows={4}
                variant="filled"
              />
            </DialogContent>
            <DialogActions>
              <Button mr={2} variant="contained" onClick={handleSaveNoteForm} size="small">
                Konfirmasi
              </Button>
              <Button variant="contained" color="error" onClick={handleCloseNoteForm} size="small">
                Batal
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog Pilihan Pembayaran: Kasir vs Mandiri */}
      <Dialog
        key="PaymentMethodDlg"
        open={showPaymentMethodDlg}
        onClose={() => setShowPaymentMethodDlg(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <Typography variant="h6" fontWeight={700}>
            Pilih Cara Pembayaran
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Bayar sekarang atau nanti di kasir?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {/* Pilihan 1: Bayar di Kasir */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handlePayAtKasir}
            sx={{
              py: 2,
              mb: 1.5,
              borderRadius: 2,
              borderWidth: 2,
              justifyContent: 'flex-start',
              gap: 2,
              textTransform: 'none',
              '&:hover': { borderWidth: 2, bgcolor: '#f0f4ff' },
            }}
          >
            <CashierIcon sx={{ fontSize: 32, color: '#3f50b5' }} />
            <div style={{ textAlign: 'left' }}>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                Bayar di Kasir
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pesanan langsung dikirim ke dapur.{'\n'}
                Bayar saat mengambil atau di meja kasir.
              </Typography>
            </div>
          </Button>

          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary">atau</Typography>
          </Divider>

          {/* Pilihan 2: Bayar Mandiri */}
          <Button
            fullWidth
            variant="outlined"
            color="success"
            onClick={handlePaySelf}
            sx={{
              py: 2,
              mt: 1.5,
              borderRadius: 2,
              borderWidth: 2,
              justifyContent: 'flex-start',
              gap: 2,
              textTransform: 'none',
              '&:hover': { borderWidth: 2, bgcolor: '#f0fff4' },
            }}
          >
            <SelfPayIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
            <div style={{ textAlign: 'left' }}>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                Bayar Sendiri (Mandiri)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bayar sekarang lewat QRIS, transfer,{'\n'}
                atau metode digital lainnya.
              </Typography>
            </div>
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowPaymentMethodDlg(false)}
          >
            Batal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden order slip component untuk kasir — rendered tapi tidak terlihat */}
      {kasirResult && (
        <div style={{ display: 'none' }}>
          <BQOOrderSlip
            ref={printComponentRef}
            datas={{
              orderInfo:    info,
              cart:         kasirResult.cartItems,
              subtotal:     kasirResult.subtotal,
              taxAmount:    kasirResult.taxAmount,
              total:        kasirResult.total,
              nomorPesanan: kasirResult.cqonum || kasirResult.nomorBon,
            }}
          />
        </div>
      )}

      {/* Dialog Konfirmasi Pesanan Kasir + Struk */}
      <Dialog
        key="KasirConfirmDlg"
        open={!!kasirResult}
        onClose={() => {}}   // tidak bisa ditutup tanpa aksi — harus cetak atau skip
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 0.5 }} />
          <Typography variant="h6" fontWeight={700} display="block">
            Pesanan Diterima!
          </Typography>
          {kasirResult?.nomorBon && (
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              No. Pesanan: <b>{kasirResult.nomorBon}</b>
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, pb: 0 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Tunjukkan struk ini ke kasir saat pembayaran.
          </Typography>
          <Divider sx={{ mt: 1.5, mb: 0.5 }} />
          {/* Ringkasan item */}
          {kasirResult?.cartItems?.map((d, i) => (
            <Grid key={i} container justifyContent="space-between" py={0.3}>
              <Grid item xs={8}>
                <Typography variant="caption">
                  {d.qty}× {d.item.name}
                  {d.note ? <span style={{ color: '#999' }}> ({d.note})</span> : ''}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="caption">
                  Rp {toCurrencyIDR(parseFloat(d.item.sellPrice) * d.qty)}
                </Typography>
              </Grid>
            </Grid>
          ))}
          <Divider sx={{ mt: 0.5, mb: 0.5 }} />
          <Grid container justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">Subtotal</Typography>
            <Typography variant="caption">Rp {toCurrencyIDR(kasirResult?.subtotal || 0)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">Pajak ({TAX_PERCENT}%)</Typography>
            <Typography variant="caption">Rp {toCurrencyIDR(kasirResult?.taxAmount || 0)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between" mt={0.3}>
            <Typography variant="body2" fontWeight={700}>Total</Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              Rp {toCurrencyIDR(kasirResult?.total || 0)}
            </Typography>
          </Grid>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            mt={1}
            sx={{ fontStyle: 'italic' }}
          >
            Meja: {info.seatNumber} · {info.orderByName}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 1.5, flexDirection: 'column', gap: 1 }}>
          {/* Tombol download bukti pesanan */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReceipt}
          >
            Download Bukti Pesanan
          </Button>
          {/* Tombol print — dikontrol via show_print_button di app.cfg */}
          {getAppConfig().show_print_button !== false && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              color={printCount > 0 ? 'success' : 'primary'}
            >
              {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Tanda Pesanan'}
            </Button>
          )}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleNewOrderAfterKasir}
          >
            Pesanan Baru
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
