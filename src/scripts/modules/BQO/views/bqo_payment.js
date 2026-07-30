import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import MoneyIcon from '@mui/icons-material/Money';
import QrCodeIcon from '@mui/icons-material/QrCode';
import RefreshIcon from '@mui/icons-material/Refresh';

import ToastBar from '../../../components/ToastBar';
import AlertDialog from '../../../components/AlertDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';

import bqo_api from '../controllers/bqo_api';
import useXenditPayment from '../hooks/useXenditPayment';
import usePrintReceipt from '../hooks/usePrintReceipt';
import useFailedTrxDownload from '../../../utils/failed-trx-download';
import { getAppConfig, isFeatureEnabled } from '../../../utils/app-config';
import { toCurrencyIDR } from '../../../utils/formatter';
import BQOReceipt from '../reports/BQOReceipt';

// Env flags
const USE_XENDIT      = process.env.REACT_APP_USE_XENDIT_PAYMENT === 'Y';
const CASH_BANK_CODE  = (process.env.REACT_APP_CASH_BANK_CODE   || 'T000').trim();
const XENDIT_BANK_CODE = (process.env.REACT_APP_XENDIT_BANK_CODE || 'X000').trim();

const TAX_PERCENT = 11;

const STATUS = { PENDING: 'pending', PAID: 'paid' };

export default function BQOPayment() {
  const navigate  = useNavigate();
  const _appCfg   = getAppConfig();
  const isLocalServer      = _appCfg.server_mode === 'local';
  const labelPusat         = isLocalServer ? 'Server Ini'   : 'Server Utama';
  const labelLokal         = isLocalServer ? 'Server Utama' : 'Server Lokal';
  const enableFailDownload = isFeatureEnabled('enable_fail_download');

  // ── Baca data dari localStorage ──────────────────────────────────────────
  const cart      = JSON.parse(window.localStorage.getItem('QoCart')      || '{}');
  const orderInfo = JSON.parse(window.localStorage.getItem('QoOrderInfo') || '{}');
  const cartItems = Object.values(cart);

  const subtotal  = cartItems.reduce((acc, d) => acc + parseFloat(d.item.sellPrice) * d.qty, 0);
  const taxAmount = Math.floor(subtotal * (TAX_PERCENT / 100));
  const total     = subtotal + taxAmount;
  const externalId = String(+new Date()); // timestamp sebagai external ID sementara

  // ── State ─────────────────────────────────────────────────────────────────
  const [paymentStatus,       setPaymentStatus]       = useState(STATUS.PENDING);
  const [paymentMethod,       setPaymentMethod]       = useState('');  // label untuk struk
  const [nomorBon,            setNomorBon]            = useState('');
  const [isSavedToLocal,      setIsSavedToLocal]      = useState(false);
  const [isManuallyCompleted, setIsManuallyCompleted] = useState(false);
  const [isValidating,        setIsValidating]        = useState(false);
  const [failedPayload,       setFailedPayload]       = useState(null);
  const [xenditSaveError,     setXenditSaveError]     = useState(null);
  const [tunaiSaveError,      setTunaiSaveError]      = useState(null);
  const [activeView,          setActiveView]          = useState('choose'); // 'choose'|'tunai'|'xendit-channel'|'xendit-waiting'
  const [bankList,            setBankList]            = useState([]);
  const [bankListLoading,     setBankListLoading]     = useState(false);
  const prevUserRef = useRef(null);

  const isPaid = paymentStatus === STATUS.PAID;

  // ── Redirect jika cart kosong ─────────────────────────────────────────────
  useEffect(() => {
    if (cartItems.length === 0) navigate('/menu');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch daftar bank untuk Xendit channel ────────────────────────────────
  useEffect(() => {
    if (activeView !== 'xendit-channel') return;
    let active = true;
    const fetchBanks = async () => {
      try {
        setBankListLoading(true);
        const { default: bbank_api } = await import('../../BBANK/controllers/bbank_api');
        const res = await bbank_api.getList({
          offset: 0, limit: 99, usebrwdef: false,
          listfields: ['cbnkid', 'cinitial', 'cbnkname'],
          query: { keysearch: { index: 1, search: '' }, textfilter: { search: '' } },
        });
        if (active && res.result) setBankList(res.data || []);
      } catch (_) { /* diam */ }
      finally { setBankListLoading(false); }
    };
    fetchBanks();
    return () => { active = false; };
  }, [activeView]);

  // ── Print receipt ─────────────────────────────────────────────────────────
  const checkMainServerAfterPrint = useCallback(async () => {
    if (!isSavedToLocal) return;
    try {
      await fetch(process.env.REACT_APP_API_ENDPOINT, {
        method: 'HEAD',
        signal: AbortSignal.timeout(2000),
        cache: 'no-store',
      });
      // server utama hidup — kasir lanjut seperti biasa
    } catch (_) {
      ToastBar('warning', 'Server utama masih tidak bisa dijangkau.', 3000);
    }
  }, [isSavedToLocal]);

  const { printComponentRef, handlePrint, printCount } = usePrintReceipt({
    callbackAfterPrint: checkMainServerAfterPrint,
  });

  // ── Failed trx download ───────────────────────────────────────────────────
  const { isDownloaded, downloadFailedTrx } = useFailedTrxDownload();

  const handleDownloadAndComplete = (errorType) => {
    if (!failedPayload) return;
    downloadFailedTrx(failedPayload, errorType, { seatNumber: orderInfo.seatNumber });
    setIsManuallyCompleted(true);
    setPaymentStatus(STATUS.PAID);
  };

  // ── Build payload ─────────────────────────────────────────────────────────
  const buildPayload = (cbnkid) => ({
    info: orderInfo,
    cart: cartItems,
    paymentInfo: { cbnkid, namount: total },
    taxAmount,
    subtotal,
    total,
  });

  // ── Core save ke backend ──────────────────────────────────────────────────
  const executeSave = async ({ payload, isXenditMode = false }) => {
    setFailedPayload(payload);
    try {
      setIsValidating(true);
      if (!isXenditMode) setTunaiSaveError(null);
      setXenditSaveError(null);

      const result = await bqo_api.add(payload);

      if (result.result === true) {
        const bon = result.onsuccess?.cordernum || result.onsuccess?.csonum || externalId;
        setNomorBon(bon);
        ToastBar('success', `Pesanan berhasil disimpan: ${bon}`, 3000);
        setPaymentStatus(STATUS.PAID);
      } else if (result.result === false) {
        const errMsg = result.onfail?.cerror || 'Backend menolak transaksi.';
        if (isXenditMode) setXenditSaveError({ type: 'backend_reject', message: errMsg });
        else              setTunaiSaveError({ type: 'backend_reject', message: errMsg });
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (err) {
      // Network error — tawarkan retry atau simpan ke server lokal
      const _isXenditMode = isXenditMode;
      if (_isXenditMode) setXenditSaveError({ type: 'network_error', message: `${labelPusat} tidak dapat dijangkau.` });
      else               setTunaiSaveError({ type: 'network_error', message: `${labelPusat} tidak dapat dijangkau.` });

      setTimeout(() => {
        ConfirmDialog(
          `Gagal Simpan ke ${labelPusat}`,
          `${labelPusat} tidak dapat dijangkau.\n\nCoba simpan ke ${labelLokal}?`,
          `Simpan ke ${labelLokal}`,
          () => handleSaveToLocal(payload, _isXenditMode),
          'Coba Lagi',
          () => executeSave({ payload, isXenditMode: _isXenditMode }),
        );
      }, 0);
    } finally {
      setIsValidating(false);
    }
  };

  // ── Simpan ke server lokal ────────────────────────────────────────────────
  const handleSaveToLocal = async (payload, isXenditMode = false) => {
    try {
      setIsValidating(true);
      const localPayload = { ...payload, _remark: '[LOCAL-FALLBACK] Gagal rekam ke Pusat' };
      const result = await bqo_api.addToLocal(localPayload);
      if (result.result === true) {
        const bon = result.onsuccess?.cordernum || externalId;
        setNomorBon(bon);
        setIsSavedToLocal(true);
        setPaymentStatus(STATUS.PAID);
        ToastBar('warning', `Tersimpan di ${labelLokal}: ${bon}. Sync ke ${labelPusat} diperlukan.`, 4000);
      } else {
        const errMsg = result.onfail?.cerror || 'Gagal ke server lokal juga.';
        if (isXenditMode) setXenditSaveError({ type: 'backend_reject', message: errMsg });
        else              setTunaiSaveError({ type: 'backend_reject', message: errMsg });
        if (enableFailDownload) {
          AlertDialog('error', 'Kedua Server Gagal',
            'Unduh data transaksi untuk rekonsiliasi manual?',
            () => handleDownloadAndComplete('both_servers_failed'));
        }
      }
    } catch (err) {
      if (enableFailDownload) {
        AlertDialog('error', 'Kedua Server Tidak Bisa Dijangkau',
          'Unduh data transaksi untuk rekonsiliasi manual?',
          () => handleDownloadAndComplete('network_error'));
      }
    } finally {
      setIsValidating(false);
    }
  };

  // ── Pembayaran TUNAI ──────────────────────────────────────────────────────
  const handlePayTunai = () => {
    setPaymentMethod('Tunai');
    const payload = buildPayload(CASH_BANK_CODE);
    executeSave({ payload, isXenditMode: false });
  };

  // ── Xendit: callback saat pembayaran sukses ───────────────────────────────
  const handleXenditSuccess = useCallback((referenceId, status, paymentType) => {
    const label = paymentType ? `Xendit (${paymentType})` : 'Xendit';
    setPaymentMethod(label);
    const payload = buildPayload(XENDIT_BANK_CODE);
    executeSave({ payload, isXenditMode: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    xenditPaymentInfo,
    isLoadingXenditPayment,
    handleCheckIsXenditPayment,
    handleFetchXenditPayment,
    handleCheckXenditStatus,
    resetXenditPaymentInfo,
  } = useXenditPayment({
    cartItems,
    orderInfo,
    externalId,
    total,
    taxAmount,
    onPaymentSuccess: handleXenditSuccess,
  });

  // ── Pilih channel Xendit ──────────────────────────────────────────────────
  const handleSelectXenditChannel = (bankItem) => {
    if (!handleCheckIsXenditPayment(bankItem)) {
      ToastBar('error', 'Channel ini tidak didukung Xendit.', 3000);
      return;
    }
    const label = bankItem.cbnkid || bankItem.cinitial || 'Xendit';
    setPaymentMethod(label);
    setActiveView('xendit-waiting');
    handleFetchXenditPayment(bankItem);
  };

  // ── Reset & New Order ─────────────────────────────────────────────────────
  const handleNewOrder = () => {
    const doProceed = () => {
      window.localStorage.removeItem('QoCart');
      window.localStorage.removeItem('QoOrderInfo');
      navigate('/menu');
    };
    if (isPaid && printCount === 0 && !isManuallyCompleted) {
      AlertDialog('warning', 'Belum Cetak Struk',
        'Silakan cetak struk terlebih dahulu sebelum pesanan baru.',
        () => handlePrint());
      return;
    }
    doProceed();
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderSummary = () => (
    <Container maxWidth="sm" sx={{ bgcolor: '#fff', p: 2, mb: 1, boxShadow: '0 0 4px -2px #000' }}>
      <Typography variant="body1" fontWeight={600} mb={1}>Ringkasan Pesanan</Typography>
      {cartItems.map((d, i) => (
        <Grid key={i} container justifyContent="space-between">
          <Grid item xs={8}>
            <Typography variant="body2">{d.qty}x {d.item.name}{d.note ? ` (${d.note})` : ''}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2">Rp {toCurrencyIDR(parseFloat(d.item.sellPrice) * d.qty)}</Typography>
          </Grid>
        </Grid>
      ))}
      <Divider sx={{ my: 1 }} />
      <Grid container justifyContent="space-between">
        <Typography variant="body2">Subtotal</Typography>
        <Typography variant="body2">Rp {toCurrencyIDR(subtotal)}</Typography>
      </Grid>
      <Grid container justifyContent="space-between">
        <Typography variant="body2">Pajak (11%)</Typography>
        <Typography variant="body2">Rp {toCurrencyIDR(taxAmount)}</Typography>
      </Grid>
      <Grid container justifyContent="space-between" mt={0.5}>
        <Typography variant="body1" fontWeight={700}>Total</Typography>
        <Typography variant="body1" fontWeight={700} color="primary">Rp {toCurrencyIDR(total)}</Typography>
      </Grid>
    </Container>
  );

  const renderChooseView = () => (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      {renderSummary()}
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
        Pilih metode pembayaran:
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={USE_XENDIT ? 6 : 12}>
          <Button
            fullWidth variant="contained" size="large" color="success"
            startIcon={<MoneyIcon />}
            onClick={() => { setActiveView('tunai'); }}
            sx={{ py: 2 }}
          >
            Tunai
          </Button>
        </Grid>
        {USE_XENDIT && (
          <Grid item xs={6}>
            <Button
              fullWidth variant="contained" size="large" color="primary"
              startIcon={<QrCodeIcon />}
              onClick={() => setActiveView('xendit-channel')}
              sx={{ py: 2 }}
            >
              Bayar Digital
            </Button>
          </Grid>
        )}
      </Grid>
    </Container>
  );

  const renderTunaiView = () => (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      {renderSummary()}
      {tunaiSaveError && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {tunaiSaveError.message}
          {tunaiSaveError.type === 'backend_reject' && (
            <Button size="small" onClick={() => executeSave({ payload: failedPayload })} sx={{ ml: 1 }}>
              Coba Lagi
            </Button>
          )}
        </Alert>
      )}
      <Box textAlign="center" mt={2}>
        {isValidating
          ? <CircularProgress />
          : (
            <Button
              variant="contained" color="success" size="large"
              startIcon={<MoneyIcon />}
              onClick={handlePayTunai}
              sx={{ py: 2, px: 6 }}
            >
              Konfirmasi Pembayaran Tunai
            </Button>
          )
        }
        <Box mt={1}>
          <Button size="small" onClick={() => setActiveView('choose')}>← Kembali</Button>
        </Box>
      </Box>
    </Container>
  );

  const renderXenditChannelView = () => (
    <Container maxWidth="sm" sx={{ mt: 1 }}>
      {renderSummary()}
      <Typography variant="body2" fontWeight={600} mb={1}>Pilih Channel Pembayaran:</Typography>
      {bankListLoading
        ? <Box textAlign="center"><CircularProgress size={24} /></Box>
        : bankList.length > 0
          ? (
            <List dense>
              {bankList.map((item, i) => (
                <ListItem key={i} disablePadding sx={{ bgcolor: i % 2 === 0 ? '#f5f5f5' : '#fff' }}>
                  <ListItemButton onClick={() => handleSelectXenditChannel(item)}>
                    <PaymentIcon fontSize="small" sx={{ mr: 1, color: '#3f50b5' }} />
                    <ListItemText
                      primary={item.cbnkid || item.cinitial}
                      secondary={item.cbnkname}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )
          : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              Tidak ada channel tersedia. Gunakan Tunai.
            </Typography>
          )
      }
      <Box mt={1}>
        <Button size="small" onClick={() => setActiveView('choose')}>← Kembali</Button>
      </Box>
    </Container>
  );

  const renderXenditWaitingView = () => {
    const { status, xenditType, paymentResponse } = xenditPaymentInfo;
    const qrUrl    = paymentResponse?.actions?.find?.(a => a.action === 'generate_qr_code')?.url
                  || paymentResponse?.qr_string
                  || null;
    const invoiceUrl = paymentResponse?.invoice_url || null;

    return (
      <Container maxWidth="sm" sx={{ mt: 1, textAlign: 'center' }}>
        {renderSummary()}
        {xenditSaveError && (
          <Alert severity="error" sx={{ mb: 1, textAlign: 'left' }}>
            <strong>Gagal menyimpan ke backend.</strong><br />
            {xenditSaveError.message}
            <Box mt={1}>
              <Button size="small" variant="outlined" onClick={() => executeSave({ payload: failedPayload, isXenditMode: true })}>
                Coba Lagi ke {labelPusat}
              </Button>
              <Button size="small" color="warning" sx={{ ml: 1 }} onClick={() => handleSaveToLocal(failedPayload, true)}>
                Simpan ke {labelLokal}
              </Button>
            </Box>
          </Alert>
        )}
        {isLoadingXenditPayment && (
          <Box py={3}><CircularProgress /><Typography mt={1} variant="body2">Membuat tagihan...</Typography></Box>
        )}
        {status === 'pending' && !isLoadingXenditPayment && (
          <Box py={2}>
            <Typography variant="body1" fontWeight={600} mb={1}>
              Menunggu pembayaran via {paymentMethod}...
            </Typography>
            {invoiceUrl && (
              <Box mb={2}>
                <Typography variant="body2" mb={1}>Buka link berikut untuk membayar:</Typography>
                <Button variant="outlined" href={invoiceUrl} target="_blank" rel="noreferrer">
                  Buka Halaman Pembayaran
                </Button>
              </Box>
            )}
            {qrUrl && xenditType === 'qris' && (
              <Box mb={2}>
                <Typography variant="body2" mb={1}>Scan QR Code:</Typography>
                <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
              </Box>
            )}
            <Button size="small" startIcon={<RefreshIcon />} onClick={handleCheckXenditStatus} sx={{ mt: 1 }}>
              Cek Status
            </Button>
          </Box>
        )}
        {status === 'failed' && (
          <Box py={2}>
            <Alert severity="error">Pembayaran gagal atau kedaluwarsa.</Alert>
            <Button sx={{ mt: 2 }} onClick={() => { resetXenditPaymentInfo(); setActiveView('xendit-channel'); }}>
              Pilih Channel Lain
            </Button>
          </Box>
        )}
        {status === 'timeout' && (
          <Box py={2}>
            <Alert severity="warning">Waktu pembayaran habis.</Alert>
            <Button sx={{ mt: 2 }} onClick={() => { resetXenditPaymentInfo(); setActiveView('xendit-channel'); }}>
              Coba Lagi
            </Button>
          </Box>
        )}
        {isValidating && (
          <Box py={2}><CircularProgress /><Typography mt={1} variant="body2">Menyimpan transaksi...</Typography></Box>
        )}
        <Box mt={1}>
          <Button size="small" onClick={() => { resetXenditPaymentInfo(); setActiveView('choose'); }}>← Kembali</Button>
        </Box>
      </Container>
    );
  };

  const renderPaidView = () => (
    <Container maxWidth="sm" sx={{ mt: 1, textAlign: 'center' }}>
      <Box py={3}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
        <Typography variant="h6" color="success.main" mt={1}>
          {isManuallyCompleted ? 'Transaksi Dicatat Manual' : 'Pesanan Berhasil!'}
        </Typography>
        {nomorBon && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            No. Bon: <strong>{nomorBon}</strong>
          </Typography>
        )}
        {isSavedToLocal && (
          <Alert severity="warning" sx={{ mt: 1, textAlign: 'left' }}>
            Tersimpan di <strong>{labelLokal}</strong>. Perlu sinkronisasi ke {labelPusat}.
          </Alert>
        )}
        {isManuallyCompleted && (
          <Alert severity="error" sx={{ mt: 1, textAlign: 'left' }}>
            Data transaksi telah diunduh. Lakukan rekonsiliasi manual.
          </Alert>
        )}
      </Box>
      {renderSummary()}
      <Grid container spacing={1} justifyContent="center" mt={1} mb={4}>
        <Grid item>
          <Button
            variant="outlined" startIcon={<PrintIcon />}
            onClick={handlePrint}
            color={printCount > 0 ? 'success' : 'primary'}
          >
            {printCount > 0 ? `Cetak Ulang (${printCount}x)` : 'Cetak Struk'}
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleNewOrder}>
            Pesanan Baru
          </Button>
        </Grid>
        {enableFailDownload && !isManuallyCompleted && (
          <Grid item>
            <Button
              variant="outlined" color="warning" size="small"
              onClick={() => handleDownloadAndComplete('manual')}
            >
              Unduh Data
            </Button>
          </Grid>
        )}
      </Grid>
    </Container>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Hidden receipt component for printing */}
      <div style={{ display: 'none' }}>
        <BQOReceipt
          ref={printComponentRef}
          datas={{
            cart: cartItems,
            orderInfo,
            subtotal,
            taxAmount,
            total,
            paymentMethod,
            nomorBon: nomorBon || externalId,
            isLocalServer,
            showArchiveCopy: isSavedToLocal || isManuallyCompleted || isLocalServer,
            isUnrecorded: isManuallyCompleted,
          }}
        />
      </div>

      {/* App Bar */}
      <AppBar position="fixed" sx={{ backgroundColor: '#fff' }}>
        <Toolbar>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={2}>
              {!isPaid && (
                <IconButton sx={{ color: '#3f50b5' }} onClick={() => navigate('/checkout')}>
                  <BackIcon />
                </IconButton>
              )}
            </Grid>
            <Grid item xs={8}>
              <Typography variant="h6" component="h1" color="black" textAlign="center">
                Pembayaran
              </Typography>
            </Grid>
            <Grid item xs={2} />
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ paddingTop: '56px', paddingBottom: '40px', background: '#eee', minHeight: '100vh' }}>
        {isPaid
          ? renderPaidView()
          : activeView === 'choose'         ? renderChooseView()
          : activeView === 'tunai'          ? renderTunaiView()
          : activeView === 'xendit-channel' ? renderXenditChannelView()
          : activeView === 'xendit-waiting' ? renderXenditWaitingView()
          : renderChooseView()
        }

        {/* Copyright */}
        <Container sx={{ mt: 4 }}>
          <Typography color="#b7b7b7" variant="body2" textAlign="center">
            Powered By <b style={{ color: '#3f50b5' }}>CSA Computer</b>
          </Typography>
        </Container>
      </Box>
    </>
  );
}
