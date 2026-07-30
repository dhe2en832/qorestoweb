import React, { useState, useEffect, useRef, useCallback } from 'react';import { useNavigate } from 'react-router-dom';
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
import BackIcon from '@mui/icons-material/ArrowBackIos';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import { fetchPaymentAPI, getPaymentAPIUrl, PRIMARY_BASE_URL, LOCAL_BASE_URL } from '../../../utils/payment-api';
import { toCurrencyIDR } from '../../../utils/formatter';
import BQOReceipt from '../reports/BQOReceipt';
import BQOXenditChannelView from '../components/BQOXenditChannelView';
import QRCode from 'react-qr-code';

// Env flags
const USE_XENDIT      = process.env.REACT_APP_USE_XENDIT_PAYMENT === 'Y';
const CASH_BANK_CODE  = (process.env.REACT_APP_CASH_BANK_CODE   || 'T000').trim();
const XENDIT_BANK_CODE = (process.env.REACT_APP_XENDIT_BANK_CODE || 'X000').trim();

const TAX_PERCENT = 11;

const STATUS = { PENDING: 'pending', PAID: 'paid' };

export default function BQOPayment() {
  const navigate  = useNavigate();

  // ── Load app.cfg — force reload saat komponen mount ─────────────────────
  const [appCfg, setAppCfg] = useState(() => getAppConfig());
  useEffect(() => {
    // Selalu load ulang saat komponen payment mount — pastikan config terbaru
    import('../../../utils/app-config').then(({ loadAppConfig }) => {
      loadAppConfig().then((cfg) => setAppCfg({ ...cfg }));
    });
  }, []);

  const isLocalServer      = appCfg.server_mode === 'local';
  const labelPusat         = isLocalServer ? 'Server Ini'   : 'Server Utama';
  const labelLokal         = isLocalServer ? 'Server Utama' : 'Server Lokal';
  const enableFailDownload = isFeatureEnabled('enable_fail_download');
  const showSimulate = appCfg.xendit_show_simulate === true
    || process.env.REACT_APP_STATUS === 'development'; // selalu tampil di dev mode

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
  const [isSimulating,        setIsSimulating]        = useState(false);
  const [simulationSent,      setSimulationSent]      = useState(false);
  const prevUserRef = useRef(null);

  const isPaid = paymentStatus === STATUS.PAID;

  // ── Redirect jika cart kosong ─────────────────────────────────────────────
  useEffect(() => {
    if (cartItems.length === 0) navigate('/menu');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        const errMsg    = result.onfail?.cerror || 'Backend menolak transaksi.';
        const errDetail = result.moreinfo?.Error || '';
        const fullMsg   = errDetail ? `${errMsg.trim()}\n\n${errDetail.trim()}` : errMsg.trim();
        if (isXenditMode) setXenditSaveError({ type: 'backend_reject', message: fullMsg });
        else              setTunaiSaveError({ type: 'backend_reject', message: fullMsg });
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (err) {
      const _isXenditMode = isXenditMode;

      // [trenly pattern] Auto-retry 1x untuk Xendit — pembayaran sudah terjadi,
      // kemungkinan gagal karena network hiccup sesaat setelah SSE konfirmasi.
      if (isXenditMode) {
        try {
          await new Promise((r) => setTimeout(r, 2000));
          const retryResult = await bqo_api.add(payload);
          if (retryResult.result === true) {
            const bon = retryResult.onsuccess?.cordernum || retryResult.onsuccess?.csonum || externalId;
            setNomorBon(bon);
            ToastBar('success', `Pesanan berhasil disimpan: ${bon}`, 3000);
            setPaymentStatus(STATUS.PAID);
            return;
          }
          // Auto-retry juga gagal — lanjut ke RETRY UI
        } catch (_) { /* lanjut ke RETRY UI */ }
      }

      // Set error state untuk RETRY UI
      const errMsg = `${labelPusat} tidak dapat dijangkau.`;
      if (_isXenditMode) setXenditSaveError({ type: 'network_error', message: errMsg });
      else               setTunaiSaveError({ type: 'network_error', message: errMsg });

      // Tawaran: coba lagi ke pusat atau simpan ke lokal
      setTimeout(() => {
        ConfirmDialog(
          `Gagal Simpan ke ${labelPusat}`,
          `${labelPusat} tidak dapat dijangkau.\n\nApakah Anda ingin mencoba lagi?`,
          `YA, COBA LAGI KE ${labelPusat.toUpperCase()}`,
          () => _isXenditMode ? handleXenditRetry() : handleTunaiRetry(),
          `TIDAK, SIMPAN KE ${labelLokal.toUpperCase()}`,
          () => _isXenditMode ? handleXenditSaveToLocal() : handleTunaiSaveToLocal(),
        );
      }, 0);
    } finally {
      setIsValidating(false);
    }
  };

  // ── Rebuild payload dari state saat ini ───────────────────────────────────
  const buildCurrentPayload = (cbnkid) => ({
    info: orderInfo,
    cart: cartItems,
    paymentInfo: { cbnkid, namount: total },
    taxAmount,
    subtotal,
    total,
  });

  // ── Tunai: retry ke pusat ─────────────────────────────────────────────────
  const handleTunaiRetry = async () => {
    if (isValidating) return;
    setTunaiSaveError(null);
    await executeSave({ payload: failedPayload || buildCurrentPayload(CASH_BANK_CODE), isXenditMode: false });
  };

  // ── Tunai: simpan ke server lokal ─────────────────────────────────────────
  const handleTunaiSaveToLocal = async () => {
    if (isValidating) return;
    const payload = { ...(failedPayload || buildCurrentPayload(CASH_BANK_CODE)), _remark: '[LOCAL-FALLBACK] Gagal rekam ke Pusat' };
    setTunaiSaveError(null);
    try {
      setIsValidating(true);
      const result = await bqo_api.addToLocal(payload);
      if (result.result === true) {
        const bon = result.onsuccess?.cordernum || externalId;
        setNomorBon(bon);
        setIsSavedToLocal(true);
        setPaymentStatus(STATUS.PAID);
        ToastBar('warning', `Tersimpan di ${labelLokal}: ${bon}. Sync ke ${labelPusat} diperlukan.`, 4000);
      } else {
        const errMsg = result.onfail?.cerror || `${labelLokal} menolak transaksi.`;
        setTunaiSaveError({ type: 'local_reject', message: errMsg });
      }
    } catch (_) {
      setTunaiSaveError({ type: 'local_unreachable', message: `${labelLokal} juga tidak bisa dijangkau. Catat transaksi secara manual.` });
      if (enableFailDownload) handleDownloadAndComplete('both_servers_failed');
    } finally {
      setIsValidating(false);
    }
  };

  // ── Xendit: retry ke pusat ────────────────────────────────────────────────
  const handleXenditRetry = async () => {
    if (isValidating) return;
    setXenditSaveError(null);
    await executeSave({ payload: failedPayload || buildCurrentPayload(XENDIT_BANK_CODE), isXenditMode: true });
  };

  // ── Xendit: simpan ke server lokal ────────────────────────────────────────
  const handleXenditSaveToLocal = async () => {
    if (isValidating) return;
    const payload = { ...(failedPayload || buildCurrentPayload(XENDIT_BANK_CODE)), _remark: '[LOCAL-FALLBACK] Gagal rekam ke Pusat' };
    setXenditSaveError(null);
    try {
      setIsValidating(true);
      const result = await bqo_api.addToLocal(payload);
      if (result.result === true) {
        const bon = result.onsuccess?.cordernum || externalId;
        setNomorBon(bon);
        setIsSavedToLocal(true);
        setPaymentStatus(STATUS.PAID);
        ToastBar('warning', `Tersimpan di ${labelLokal}: ${bon}. Sync ke ${labelPusat} diperlukan.`, 4000);
      } else {
        const errMsg = result.onfail?.cerror || `${labelLokal} menolak transaksi.`;
        setXenditSaveError({ type: 'local_reject', message: errMsg });
      }
    } catch (_) {
      setXenditSaveError({ type: 'local_unreachable', message: `${labelLokal} juga tidak bisa dijangkau. Catat transaksi secara manual.` });
      if (enableFailDownload) handleDownloadAndComplete('both_servers_failed');
    } finally {
      setIsValidating(false);
    }
  };

  // ── handleSaveToLocal (legacy — tidak lagi dipakai langsung) ─────────────
  const handleSaveToLocal = (payload, isXenditMode = false) =>
    isXenditMode ? handleXenditSaveToLocal() : handleTunaiSaveToLocal();

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

  // ── Pilih channel Xendit — channel: { code, name, category } ─────────────
  const handleSelectXenditChannel = (channel) => {
    // Buat bankItem format yang kompatibel dengan useXenditPayment
    const bankItem = {
      cbnkid:   channel.code,
      cinitial: channel.code,
      cbnkname: channel.name,
    };
    if (!handleCheckIsXenditPayment(bankItem)) {
      ToastBar('error', 'Channel ini tidak didukung Xendit.', 3000);
      return;
    }
    setPaymentMethod(channel.name || channel.code);
    setActiveView('xendit-waiting');
    handleFetchXenditPayment(bankItem);
  };

  // ── Simulasi pembayaran (test mode) ───────────────────────────────────────
  // Dikontrol oleh xendit_show_simulate di public/app.cfg
  const handleSimulatePayment = async (paymentMethodId) => {
    if (!paymentMethodId) {
      ToastBar('error', 'Payment method ID tidak tersedia.', 3000);
      return;
    }
    setSimulationSent(true);
    setIsSimulating(true);
    try {
      const res = await fetchPaymentAPI('/simulate-payment-request.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          payment_method_id: paymentMethodId,
          amount:            total,
        }),
      });
      const data = await res.json();
      // simulate-payment-request.php mengembalikan berbagai format sukses:
      // { status: 'SUCCEEDED' } atau { message: '...berhasil...' } atau { success: true }
      const isSuccess =
        data.status === 'SUCCEEDED' ||
        data.status === 'PAID' ||
        data.success === true ||
        (typeof data.message === 'string' && data.message.toLowerCase().includes('berhasil'));

      if (isSuccess) {
        ToastBar('success', 'Simulasi dikirim! Menunggu konfirmasi SSE...', 3000);
        // SSE/polling akan pick up status SUCCEEDED secara otomatis
      } else {
        ToastBar('error', 'Simulasi gagal: ' + (data.message || JSON.stringify(data)), 4000);
        setSimulationSent(false);
      }
    } catch (err) {
      ToastBar('error', 'Gagal menghubungi server simulasi.', 3000);
      setSimulationSent(false);
    } finally {
      setIsSimulating(false);
    }
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
        <Alert severity={tunaiSaveError.type === 'backend_reject' ? 'error' : 'warning'} sx={{ mb: 1 }}>
          <strong>Gagal menyimpan pesanan.</strong><br />
          {tunaiSaveError.message}
          <Box mt={1} display="flex" gap={1} flexWrap="wrap">
            {tunaiSaveError.type !== 'local_unreachable' && (
              <Button size="small" variant="outlined" color="warning"
                onClick={() => ConfirmDialog(
                  'Coba Lagi Simpan',
                  `Apakah Anda ingin mencoba lagi ke ${labelPusat}?`,
                  `YA, COBA LAGI KE ${labelPusat.toUpperCase()}`,
                  handleTunaiRetry,
                  `TIDAK, SIMPAN KE ${labelLokal.toUpperCase()}`,
                  handleTunaiSaveToLocal,
                )}
                disabled={isValidating}
              >
                {isValidating ? <CircularProgress size={14} /> : `⟳ Coba Lagi ke ${labelPusat}`}
              </Button>
            )}
            {tunaiSaveError.type === 'network_error' && (
              <Button size="small" variant="outlined" color="secondary"
                onClick={handleTunaiSaveToLocal} disabled={isValidating}>
                Simpan ke {labelLokal}
              </Button>
            )}
            {enableFailDownload && ['network_error', 'local_unreachable'].includes(tunaiSaveError.type) && (
              <Button size="small" variant="outlined" color="error"
                onClick={() => handleDownloadAndComplete(tunaiSaveError.type)}>
                ⬇ Unduh Data
              </Button>
            )}
          </Box>
        </Alert>
      )}
      <Box textAlign="center" mt={2}>
        {isValidating
          ? <CircularProgress />
          : !tunaiSaveError && (
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
      <BQOXenditChannelView
        selectedChannel={null}
        onSelect={handleSelectXenditChannel}
      />
      <Box mt={1}>
        <Button size="small" onClick={() => setActiveView('choose')}>← Kembali</Button>
      </Box>
    </Container>
  );

  const renderXenditWaitingView = () => {
    const { status, xenditType, paymentResponse } = xenditPaymentInfo;

    // ── Ekstrak data per tipe pembayaran (mengikuti struktur response Xendit) ──
    // QRIS — qr_string dari payment_method
    const qrString =
      paymentResponse?.payment_method?.qr_code?.channel_properties?.qr_string ||
      paymentResponse?.qr_string ||
      null;

    // Virtual Account
    const vaNumber =
      paymentResponse?.payment_method?.virtual_account?.channel_properties?.virtual_account_number ||
      null;
    const vaExpiry =
      paymentResponse?.payment_method?.virtual_account?.channel_properties?.expires_at ||
      null;
    const vaBank =
      paymentResponse?.payment_method?.virtual_account?.channel_code ||
      paymentMethod || '';

    // E-Wallet — ambil URL redirect
    const ewalletRedirectUrl = (() => {
      const actions = paymentResponse?.actions || [];
      const webAction =
        actions.find((a) => a.action === 'AUTH' && a.url_type === 'WEB') ||
        actions.find((a) => a.action === 'AUTH') ||
        actions.find((a) => a.type === 'REDIRECT_CUSTOMER');
      return webAction?.url ||
        webAction?.value ||
        paymentResponse?.payment_method?.ewallet?.channel_properties?.mobile_web_checkout_url ||
        null;
    })();

    // Retail Outlet (Alfamart/Indomaret)
    const otcCode =
      paymentResponse?.payment_method?.over_the_counter?.channel_properties?.payment_code ||
      null;
    const otcExpiry =
      paymentResponse?.payment_method?.over_the_counter?.channel_properties?.expires_at ||
      null;

    // Invoice URL (mode invoice)
    const invoiceUrl = paymentResponse?.invoice_url || null;

    return (
      <Container maxWidth="sm" sx={{ mt: 1 }}>
        {renderSummary()}

        {/* Error simpan ke backend */}
        {xenditSaveError && (
          <Alert severity={xenditSaveError.type === 'backend_reject' ? 'error' : 'warning'} sx={{ mb: 1 }}>
            <strong>Gagal menyimpan pesanan. Pembayaran sudah diterima Xendit.</strong><br />
            {xenditSaveError.message}
            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
              {xenditSaveError.type !== 'local_unreachable' && (
                <Button size="small" variant="outlined" color="warning"
                  onClick={() => ConfirmDialog(
                    'Coba Lagi Simpan',
                    `Pembayaran Xendit sudah berhasil. Apakah Anda ingin mencoba simpan ke ${labelPusat}?`,
                    `YA, COBA LAGI KE ${labelPusat.toUpperCase()}`,
                    handleXenditRetry,
                    `TIDAK, SIMPAN KE ${labelLokal.toUpperCase()}`,
                    handleXenditSaveToLocal,
                  )}
                  disabled={isValidating}
                >
                  {isValidating ? <CircularProgress size={14} /> : `⟳ Coba Lagi ke ${labelPusat}`}
                </Button>
              )}
              {xenditSaveError.type === 'network_error' && (
                <Button size="small" variant="outlined" color="secondary"
                  onClick={handleXenditSaveToLocal} disabled={isValidating}>
                  Simpan ke {labelLokal}
                </Button>
              )}
              {enableFailDownload && ['network_error', 'local_unreachable'].includes(xenditSaveError.type) && (
                <Button size="small" variant="outlined" color="error"
                  onClick={() => handleDownloadAndComplete(xenditSaveError.type)}>
                  ⬇ Unduh Data
                </Button>
              )}
            </Box>
          </Alert>
        )}

        {/* Loading saat membuat tagihan */}
        {isLoadingXenditPayment && (
          <Box textAlign="center" py={3}>
            <CircularProgress />
            <Typography mt={1} variant="body2">Membuat tagihan...</Typography>
          </Box>
        )}

        {/* Pending — tampilkan instruksi bayar */}
        {status === 'pending' && !isLoadingXenditPayment && (
          <Box>
            <Typography variant="body1" fontWeight={600} textAlign="center" mb={2}>
              Menunggu pembayaran via <b>{paymentMethod}</b>
            </Typography>

            {/* QRIS — render QR code dari string */}
            {xenditType === 'qris' && (
              <Box textAlign="center" mb={2}>
                {qrString ? (
                  <>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Scan QR Code di bawah untuk membayar
                    </Typography>
                    <Box
                      display="inline-block"
                      p={2}
                      sx={{ border: '2px solid #1976d2', borderRadius: 2, bgcolor: '#fff' }}
                    >
                      <QRCode value={qrString} size={180} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Gunakan aplikasi mobile banking atau e-wallet apapun yang mendukung QRIS
                    </Typography>
                  </>
                ) : (
                  <Alert severity="info">
                    QR string tidak tersedia di test mode. Klik <b>CEK STATUS</b> untuk simulasi.
                  </Alert>
                )}
              </Box>
            )}

            {/* Virtual Account — tampilkan nomor VA */}
            {xenditType === 'va' && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Transfer ke nomor Virtual Account:
                </Typography>
                <Box
                  sx={{
                    background: '#e8f5e9', borderRadius: 2, p: 2,
                    textAlign: 'center', mb: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    {vaBank}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" letterSpacing={3} color="success.main">
                    {vaNumber || '(tidak tersedia di test mode)'}
                  </Typography>
                </Box>
                {vaExpiry && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Berlaku hingga: {new Date(vaExpiry).toLocaleString('id-ID')}
                  </Typography>
                )}
              </Box>
            )}

            {/* E-Wallet — tombol redirect */}
            {xenditType === 'ewallet' && (
              <Box textAlign="center" mb={2}>
                {ewalletRedirectUrl ? (
                  <>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Klik tombol untuk lanjut bayar via {paymentMethod}
                    </Typography>
                    <Button
                      variant="contained" color="success" fullWidth
                      href={ewalletRedirectUrl} target="_blank" rel="noopener noreferrer"
                    >
                      Bayar via {paymentMethod}
                    </Button>
                  </>
                ) : (
                  <Alert severity="info">
                    URL redirect tidak tersedia di test mode.
                  </Alert>
                )}
              </Box>
            )}

            {/* Retail Outlet (Alfamart/Indomaret) */}
            {xenditType === 'otc' && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Tunjukkan kode ini ke kasir {paymentMethod}:
                </Typography>
                <Box
                  sx={{
                    background: '#f3e5f5', borderRadius: 2, p: 2,
                    textAlign: 'center', mb: 1,
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" letterSpacing={4} color="purple">
                    {otcCode || '(tidak tersedia di test mode)'}
                  </Typography>
                </Box>
                {otcExpiry && (
                  <Typography variant="caption" color="text.secondary">
                    Berlaku hingga: {new Date(otcExpiry).toLocaleString('id-ID')}
                  </Typography>
                )}
              </Box>
            )}

            {/* Invoice URL */}
            {xenditType === 'invoice' && invoiceUrl && (
              <Box textAlign="center" mb={2}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Buka link Xendit untuk memilih metode dan membayar
                </Typography>
                <Button
                  variant="contained" color="primary" fullWidth
                  href={invoiceUrl} target="_blank" rel="noopener noreferrer"
                >
                  Buka Xendit Checkout
                </Button>
              </Box>
            )}

            {/* Cek Status + indikator */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                <span style={{ color: '#4caf50' }}>● Menunggu konfirmasi...</span>
              </Typography>
              <Button size="small" startIcon={<RefreshIcon />} onClick={handleCheckXenditStatus}>
                Cek Status
              </Button>
            </Box>

            {/* Tombol Simulasi — hanya tampil jika xendit_show_simulate: true di app.cfg */}
            {showSimulate && (
              <Box mt={2} pt={2} sx={{ borderTop: '1px dashed #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  🧪 <b>Test Mode</b> — simulasi konfirmasi pembayaran berhasil
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  fullWidth
                  onClick={() => {
                    const pmId =
                      xenditPaymentInfo.paymentResponse?.payment_method?.id ||
                      xenditPaymentInfo.paymentResponse?.id ||
                      xenditPaymentInfo.paymentRequestId;
                    handleSimulatePayment(pmId);
                  }}
                  disabled={isSimulating || simulationSent}
                  startIcon={
                    (isSimulating || simulationSent)
                      ? <CircularProgress size={14} color="inherit" />
                      : null
                  }
                >
                  {isSimulating
                    ? 'Mengirim simulasi...'
                    : simulationSent
                    ? 'Menunggu konfirmasi SSE...'
                    : '⚡ SIMULASI BAYAR'}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Gagal / expired */}
        {status === 'failed' && (
          <Box py={2} textAlign="center">
            <Alert severity="error" sx={{ mb: 2 }}>Pembayaran gagal atau kedaluwarsa.</Alert>
            <Button sx={{ mt: 2 }} onClick={() => { resetXenditPaymentInfo(); setSimulationSent(false); setActiveView('xendit-channel'); }}>
              Pilih Channel Lain
            </Button>
          </Box>
        )}

        {/* Timeout */}
        {status === 'timeout' && (
          <Box py={2} textAlign="center">
            <Alert severity="warning" sx={{ mb: 2 }}>Waktu pembayaran habis.</Alert>
            <Button onClick={() => { resetXenditPaymentInfo(); setActiveView('xendit-channel'); }}>
              Coba Lagi
            </Button>
          </Box>
        )}

        {/* Menyimpan transaksi setelah Xendit konfirmasi */}
        {isValidating && (
          <Box textAlign="center" py={2}>
            <CircularProgress size={24} />
            <Typography mt={1} variant="body2">Menyimpan transaksi...</Typography>
          </Box>
        )}

        <Box mt={2}>
          <Button size="small" onClick={() => { resetXenditPaymentInfo(); setActiveView('choose'); }}>
            ← Kembali
          </Button>
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
