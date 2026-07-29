/**
 * useXenditPayment.js
 *
 * Hook untuk mengelola lifecycle pembayaran Xendit:
 * create payment → SSE/polling status → callback sukses/gagal
 *
 * XENDIT_MODE (via REACT_APP_XENDIT_MODE):
 *   'invoice'         → create-invoice.php  (customer buka link, pilih metode)
 *   'payment-request' → create-payment-request.php  (QR/VA langsung di layar)
 */

import { useCallback, useRef, useState } from 'react';
import AlertDialog from '../../../components/AlertDialog';
import { getAppConfig } from '../../../utils/app-config';
import { fetchPaymentAPI, getPaymentAPIUrl, PRIMARY_BASE_URL, LOCAL_BASE_URL } from '../../../utils/payment-api';

const XENDIT_MODE = (process.env.REACT_APP_XENDIT_MODE || 'invoice').trim();

// Mapping channel → tipe Xendit
const XENDIT_PAYMENT_MAP = {
  QRIS:      { type: 'qris',    endpoint: '/create-payment-request.php' },
  BCA:       { type: 'va',      endpoint: '/create-payment-request.php' },
  BNI:       { type: 'va',      endpoint: '/create-payment-request.php' },
  BRI:       { type: 'va',      endpoint: '/create-payment-request.php' },
  MANDIRI:   { type: 'va',      endpoint: '/create-payment-request.php' },
  PERMATA:   { type: 'va',      endpoint: '/create-payment-request.php' },
  BSI:       { type: 'va',      endpoint: '/create-payment-request.php' },
  OVO:       { type: 'ewallet', endpoint: '/create-payment-request.php' },
  DANA:      { type: 'ewallet', endpoint: '/create-payment-request.php' },
  GOPAY:     { type: 'ewallet', endpoint: '/create-payment-request.php' },
  SHOPEEPAY: { type: 'ewallet', endpoint: '/create-payment-request.php' },
  LINKAJA:   { type: 'ewallet', endpoint: '/create-payment-request.php' },
  ALFAMART:  { type: 'otc',     endpoint: '/create-payment-request.php' },
  INDOMARET: { type: 'otc',     endpoint: '/create-payment-request.php' },
};

const XENDIT_ACCEPTED = [
  'QRIS', 'BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA', 'BSI',
  'OVO', 'DANA', 'GOPAY', 'SHOPEEPAY', 'LINKAJA',
  'ALFAMART', 'INDOMARET', 'CREDIT_CARD',
];

const FINAL_STATUSES = ['SUCCEEDED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'];

const initState = {
  status: 'idle',         // 'idle'|'pending'|'success'|'failed'|'timeout'
  xenditType: null,       // 'qris'|'va'|'ewallet'|'invoice'
  paymentResponse: null,
  referenceId: null,
  paymentRequestId: null,
};

export default function useXenditPayment({
  cartItems = [],
  orderInfo = { seatNumber: '', orderByName: '', phoneNumber: '' },
  externalId,
  total = 0,
  taxAmount = 0,
  onPaymentSuccess = null,
}) {
  const [xenditPaymentInfo, setXenditPaymentInfo] = useState(initState);
  const [isLoadingXenditPayment, setIsLoadingXenditPayment] = useState(false);

  const sseRef         = useRef(null);
  const pollingRef     = useRef(null);
  const pollTimeoutRef = useRef(null);

  const _appCfg        = getAppConfig();
  const timeoutMinutes = parseInt(_appCfg.xendit_payment_timeout_minutes || 5, 10);
  const MAX_POLL_MS    = timeoutMinutes * 60 * 1000;

  // ── Stop SSE & polling ──────────────────────────────────────────────────────
  const stopStatusListener = useCallback(() => {
    if (sseRef.current)      { sseRef.current.close(); sseRef.current = null; }
    if (pollingRef.current)  { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (pollTimeoutRef.current) { clearTimeout(pollTimeoutRef.current); pollTimeoutRef.current = null; }
  }, []);

  const resetXenditPaymentInfo = useCallback(() => {
    stopStatusListener();
    setXenditPaymentInfo(initState);
  }, [stopStatusListener]);

  // ── Handle status update ────────────────────────────────────────────────────
  const handleStatusUpdate = useCallback((status, referenceId, paymentType = null) => {
    if (status === 'SUCCEEDED' || status === 'PAID') {
      setXenditPaymentInfo(prev => ({ ...prev, status: 'success' }));
      stopStatusListener();
      if (onPaymentSuccess) onPaymentSuccess(referenceId, status, paymentType);
    } else if (['FAILED', 'EXPIRED', 'CANCELLED'].includes(status)) {
      setXenditPaymentInfo(prev => ({ ...prev, status: 'failed' }));
      stopStatusListener();
    }
  }, [onPaymentSuccess, stopStatusListener]);

  // ── Auto-stop setelah timeout ───────────────────────────────────────────────
  const startPollTimeout = useCallback(() => {
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    pollTimeoutRef.current = setTimeout(() => {
      stopStatusListener();
      setXenditPaymentInfo(prev => ({ ...prev, status: 'timeout' }));
    }, MAX_POLL_MS);
  }, [stopStatusListener]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Polling fallback ────────────────────────────────────────────────────────
  const startPolling = useCallback((referenceId, paymentRequestId = null) => {
    const buildUrl = () => {
      let url = `/get-payment-status.php?reference_id=${encodeURIComponent(referenceId)}`;
      if (paymentRequestId) url += `&payment_request_id=${encodeURIComponent(paymentRequestId)}`;
      return url;
    };
    const doCheck = async () => {
      try {
        const res  = await fetchPaymentAPI(buildUrl());
        const data = await res.json();
        if (FINAL_STATUSES.includes(data?.status))
          handleStatusUpdate(data.status, referenceId, data.payment_type || null);
      } catch (_) { /* silent */ }
    };
    doCheck();
    pollingRef.current = setInterval(doCheck, 5000);
    startPollTimeout(referenceId);
  }, [handleStatusUpdate, startPollTimeout]);

  // ── SSE dengan fallback ke polling ─────────────────────────────────────────
  const startStatusListener = useCallback((referenceId, paymentRequestId = null) => {
    stopStatusListener();
    if (typeof EventSource === 'undefined') {
      startPolling(referenceId, paymentRequestId);
      return;
    }
    const sseUrl = paymentRequestId
      ? getPaymentAPIUrl(`/payment-stream.php?reference_id=${encodeURIComponent(referenceId)}&payment_request_id=${encodeURIComponent(paymentRequestId)}`)
      : getPaymentAPIUrl(`/payment-stream.php?reference_id=${encodeURIComponent(referenceId)}`);

    const es = new EventSource(sseUrl);
    sseRef.current = es;
    startPollTimeout(referenceId);

    es.addEventListener('status_update', (e) => {
      const data = JSON.parse(e.data);
      if (FINAL_STATUSES.includes(data?.status))
        handleStatusUpdate(data.status, referenceId, data.payment_type || null);
    });
    es.addEventListener('done', () => stopStatusListener());
    es.addEventListener('timeout', () => {
      stopStatusListener();
      pollingRef.current = setInterval(async () => {
        try {
          let url = `/get-payment-status.php?reference_id=${encodeURIComponent(referenceId)}`;
          if (paymentRequestId) url += `&payment_request_id=${encodeURIComponent(paymentRequestId)}`;
          const res  = await fetchPaymentAPI(url);
          const data = await res.json();
          if (FINAL_STATUSES.includes(data?.status))
            handleStatusUpdate(data.status, referenceId, data.payment_type || null);
        } catch (_) { /* silent */ }
      }, 10000);
    });
    es.onerror = () => { stopStatusListener(); startPolling(referenceId, paymentRequestId); };
  }, [handleStatusUpdate, startPolling, startPollTimeout, stopStatusListener]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getXenditPaymentMap = (item) => {
    const id      = item?.cbnkid?.toUpperCase();
    const initial = item?.cinitial?.toUpperCase();
    return XENDIT_PAYMENT_MAP[id] || XENDIT_PAYMENT_MAP[initial] || null;
  };

  const handleCheckIsXenditPayment = (item) => {
    const id      = item?.cbnkid?.toUpperCase();
    const initial = item?.cinitial?.toUpperCase();
    return XENDIT_ACCEPTED.includes(id) || XENDIT_ACCEPTED.includes(initial);
  };

  const handleCheckXenditStatus = useCallback(async () => {
    const refId = xenditPaymentInfo.referenceId;
    const prId  = xenditPaymentInfo.paymentRequestId;
    if (!refId) return;
    try {
      let url = `/get-payment-status.php?reference_id=${encodeURIComponent(refId)}`;
      if (prId) url += `&payment_request_id=${encodeURIComponent(prId)}`;
      const res  = await fetchPaymentAPI(url);
      const data = await res.json();
      if (FINAL_STATUSES.includes(data?.status)) handleStatusUpdate(data.status, refId);
    } catch (_) { /* silent */ }
  }, [xenditPaymentInfo.referenceId, xenditPaymentInfo.paymentRequestId, handleStatusUpdate]);

  // ── Main: buat payment Xendit ───────────────────────────────────────────────
  const handleFetchXenditPayment = async (item) => {
    if (isLoadingXenditPayment || xenditPaymentInfo.status !== 'idle') return;

    if (!externalId) {
      AlertDialog('error', 'ERROR', 'External ID tidak tersedia. Silakan coba lagi.');
      return;
    }
    if (!total || total <= 0) {
      AlertDialog('error', 'ERROR', 'Total pembayaran tidak valid.');
      return;
    }
    if (!PRIMARY_BASE_URL && !LOCAL_BASE_URL) {
      AlertDialog('error', 'ERROR', 'REACT_APP_PAYMENT_API_ENDPOINT belum dikonfigurasi.');
      return;
    }

    try {
      setIsLoadingXenditPayment(true);

      const itemsPayload = cartItems.map(({ item: i, qty }) => ({
        name:     i.name,
        price:    parseFloat(i.sellPrice),
        quantity: qty,
      }));

      // ── MODE: invoice ──────────────────────────────────────────────────────
      if (XENDIT_MODE === 'invoice') {
        const body = {
          external_id: externalId,
          amount:      total,
          description: `Pesanan Meja ${orderInfo.seatNumber} - ${externalId}`,
          customer: {
            given_names:   orderInfo.orderByName || 'Tamu',
            mobile_number: orderInfo.phoneNumber || '',
          },
          fees: [{ type: 'Tax', value: taxAmount }],
          items: itemsPayload,
        };
        const res  = await fetchPaymentAPI('/create-invoice.php', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        const json = await res.json();
        if (json.status === 'PENDING') {
          const refId = json.external_id || externalId;
          const prId  = json.id || null;
          setXenditPaymentInfo({ status: 'pending', xenditType: 'invoice', paymentResponse: json, referenceId: refId, paymentRequestId: prId });
          startStatusListener(refId, prId);
        } else throw json;
        return;
      }

      // ── MODE: payment-request ──────────────────────────────────────────────
      if (XENDIT_MODE === 'payment-request') {
        const xenditMap = getXenditPaymentMap(item);
        if (!xenditMap) return;
        const body = {
          reference_id:    externalId,
          amount:          total,
          currency:        'IDR',
          payment_channel: item?.cbnkid?.toUpperCase() || item?.cinitial?.toUpperCase(),
          description:     `Pesanan Meja ${orderInfo.seatNumber} - ${externalId}`,
          customer: {
            given_names:   orderInfo.orderByName || 'Tamu',
            mobile_number: orderInfo.phoneNumber || '',
          },
          fees:  [{ type: 'Tax', value: taxAmount }],
          items: itemsPayload,
        };
        const res  = await fetchPaymentAPI('/create-payment-request.php', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        const json = await res.json();
        if (['PENDING', 'ACTIVE', 'REQUIRES_ACTION'].includes(json.status)) {
          const refId = json.reference_id || externalId;
          const prId  = json.id || null;
          setXenditPaymentInfo({ status: 'pending', xenditType: xenditMap.type, paymentResponse: json, referenceId: refId, paymentRequestId: prId });
          startStatusListener(refId, prId);
        } else throw json;
        return;
      }

    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        const objectMain = error?.errors;
        if (objectMain && typeof objectMain === 'object') {
          const msg = Object.keys(objectMain).map((k) => objectMain[k]).join('\n');
          AlertDialog('error', 'ERROR', msg);
        } else {
          AlertDialog('error', 'ERROR', error?.message || JSON.stringify(error));
        }
      } else {
        AlertDialog('error', 'ERROR', String(error));
      }
    } finally {
      setIsLoadingXenditPayment(false);
    }
  };

  const cleanup = useCallback(() => stopStatusListener(), [stopStatusListener]);

  return {
    xenditPaymentInfo,
    isLoadingXenditPayment,
    handleCheckIsXenditPayment,
    handleFetchXenditPayment,
    handleCheckXenditStatus,
    resetXenditPaymentInfo,
    isSSEActive: !!sseRef.current,
    cleanup,
  };
}
