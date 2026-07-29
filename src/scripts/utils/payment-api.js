/**
 * payment-api.js
 *
 * Helper fetch ke Payment API (Xendit PHP gateway) dengan fallback
 * otomatis ke server lokal jika server utama tidak bisa dijangkau.
 *
 * Server utama : REACT_APP_PAYMENT_API_ENDPOINT
 * Server lokal : REACT_APP_PAYMENT_API_LOCAL_ENDPOINT
 */

export const PRIMARY_BASE_URL = (process.env.REACT_APP_PAYMENT_API_ENDPOINT || '').trim();
export const LOCAL_BASE_URL   = (process.env.REACT_APP_PAYMENT_API_LOCAL_ENDPOINT || '').trim();

const TIMEOUT_MS = 10000; // 10 detik

/**
 * Fetch ke payment API dengan auto-fallback ke server lokal.
 * Signature sama dengan fetch() biasa.
 */
export async function fetchPaymentAPI(path, options = {}) {
  const tryFetch = (baseUrl) =>
    fetch(`${baseUrl}${path}`, {
      ...options,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  try {
    return await tryFetch(PRIMARY_BASE_URL);
  } catch (_) {
    if (!LOCAL_BASE_URL) throw new Error('Server payment tidak dapat dijangkau.');
    return await tryFetch(LOCAL_BASE_URL);
  }
}

/**
 * Buat URL SSE ke payment API (primary).
 * Jika SSE gagal, polling akan otomatis aktif sebagai fallback.
 */
export function getPaymentAPIUrl(path) {
  return `${PRIMARY_BASE_URL}${path}`;
}
