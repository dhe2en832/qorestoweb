import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

/**
 * BQOXenditChannelView
 *
 * Daftar channel pembayaran Xendit untuk qorestoweb.
 * Mengikuti pola XenditChannelView di webcsa-v2 (trenly):
 *   1. Fetch dari PHP gateway: {PAYMENT_API}/get-payment-channels.php
 *   2. Jika API tidak tersedia → fallback ke daftar hardcoded
 *   3. Tidak bergantung pada bbank_x backend CSA
 *
 * Props:
 *   selectedChannel  - { code, name, category } | null
 *   onSelect         - fn(channel) dipanggil saat user pilih channel
 */

const PAYMENT_API = (process.env.REACT_APP_PAYMENT_API_ENDPOINT || '').trim();

// Label & warna per kategori
const CATEGORY_LABEL = {
  QRIS:            '🔲 QRIS',
  VIRTUAL_ACCOUNT: '🏦 Transfer Bank (Virtual Account)',
  EWALLET:         '📱 E-Wallet',
  RETAIL_OUTLET:   '🏪 Retail (Alfamart / Indomaret)',
  OTHER:           '💳 Lainnya',
};

const CATEGORY_COLOR = {
  QRIS:            '#1976d2',
  VIRTUAL_ACCOUNT: '#388e3c',
  EWALLET:         '#f57c00',
  RETAIL_OUTLET:   '#7b1fa2',
  OTHER:           '#616161',
};

// Fallback — ditampilkan saat PHP gateway tidak tersedia
const FALLBACK_CHANNELS = [
  { code: 'QRIS',      name: 'QRIS (Scan QR)',         category: 'QRIS' },
  { code: 'BCA',       name: 'BCA Virtual Account',     category: 'VIRTUAL_ACCOUNT' },
  { code: 'BNI',       name: 'BNI Virtual Account',     category: 'VIRTUAL_ACCOUNT' },
  { code: 'BRI',       name: 'BRI Virtual Account',     category: 'VIRTUAL_ACCOUNT' },
  { code: 'MANDIRI',   name: 'Mandiri Virtual Account', category: 'VIRTUAL_ACCOUNT' },
  { code: 'PERMATA',   name: 'Permata Virtual Account', category: 'VIRTUAL_ACCOUNT' },
  { code: 'OVO',       name: 'OVO',                     category: 'EWALLET' },
  { code: 'DANA',      name: 'DANA',                    category: 'EWALLET' },
  { code: 'GOPAY',     name: 'GoPay',                   category: 'EWALLET' },
  { code: 'SHOPEEPAY', name: 'ShopeePay',               category: 'EWALLET' },
  { code: 'LINKAJA',   name: 'LinkAja',                 category: 'EWALLET' },
  { code: 'ALFAMART',  name: 'Alfamart',                category: 'RETAIL_OUTLET' },
  { code: 'INDOMARET', name: 'Indomaret',               category: 'RETAIL_OUTLET' },
];

function groupChannels(channels) {
  const map = {};
  channels.forEach((ch) => {
    const key = ch.category || 'OTHER';
    if (!map[key]) map[key] = { key, channels: [] };
    map[key].channels.push(ch);
  });
  return Object.values(map);
}

export default function BQOXenditChannelView({ selectedChannel, onSelect }) {
  const [isLoading,   setIsLoading]   = useState(true);
  const [categories,  setCategories]  = useState([]);
  const [error,       setError]       = useState(null);
  const [filterText,  setFilterText]  = useState('');

  useEffect(() => {
    let active = true;

    // Jika payment API tidak dikonfigurasi → langsung pakai fallback
    if (!PAYMENT_API) {
      setCategories(groupChannels(FALLBACK_CHANNELS));
      setIsLoading(false);
      return;
    }

    fetch(`${PAYMENT_API}/get-payment-channels.php`, { signal: AbortSignal.timeout(8000) })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.status === 'success' && data.categories) {
          const filled = data.categories.filter((c) => c.channels?.length > 0);
          setCategories(filled);
        } else {
          throw new Error(data.message || 'API error');
        }
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[BQOXenditChannelView] API gagal, pakai fallback.', err);
        setError('Daftar channel dari server tidak tersedia. Menampilkan daftar default.');
        setCategories(groupChannels(FALLBACK_CHANNELS));
      })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, []);

  // Filter berdasarkan teks pencarian
  const filtered = categories
    .map((cat) => ({
      ...cat,
      channels: cat.channels.filter(
        (ch) =>
          !filterText ||
          ch.name.toLowerCase().includes(filterText.toLowerCase()) ||
          ch.code.toLowerCase().includes(filterText.toLowerCase())
      ),
    }))
    .filter((cat) => cat.channels.length > 0);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4} gap={1.5}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">Memuat channel...</Typography>
      </Box>
    );
  }

  return (
    <Box width="100%">
      {error && (
        <Alert severity="warning" sx={{ mb: 1, py: 0.5, fontSize: '0.75rem' }}>
          {error}
        </Alert>
      )}

      {/* Search box */}
      <Box
        component="input"
        placeholder="🔍 Cari channel..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '6px 12px',
          fontSize: 13,
          marginBottom: 8,
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      {/* Channel list grouped */}
      <Box sx={{ maxHeight: '55vh', overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" mt={3} variant="body2">
            Tidak ada channel ditemukan.
          </Typography>
        ) : (
          filtered.map((cat) => (
            <Box key={cat.key} mb={1.5}>
              {/* Category header */}
              <Box
                px={1} py={0.4} mb={0.5}
                sx={{ background: CATEGORY_COLOR[cat.key] || '#616161', borderRadius: 1 }}
              >
                <Typography variant="caption" color="#fff" fontWeight="bold">
                  {CATEGORY_LABEL[cat.key] || cat.key}
                </Typography>
              </Box>

              <List dense disablePadding>
                {cat.channels.map((ch, idx) => {
                  const isSelected = selectedChannel?.code === ch.code;
                  return (
                    <ListItem
                      key={ch.code}
                      disablePadding
                      disableGutters
                      sx={{
                        bgcolor: isSelected
                          ? '#b2ebf2'
                          : idx % 2 === 0 ? '#f9f9f9' : '#fff',
                        borderLeft: isSelected
                          ? `3px solid ${CATEGORY_COLOR[cat.key] || '#1976d2'}`
                          : '3px solid transparent',
                      }}
                    >
                      <ListItemButton onClick={() => onSelect(ch)} sx={{ py: 0.6, px: 1 }}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="body2"
                                fontWeight={isSelected ? 'bold' : 'normal'}
                              >
                                {ch.name}
                              </Typography>
                              {isSelected && (
                                <Chip
                                  label="✓" size="small" color="info"
                                  sx={{ height: 16, fontSize: 10 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {ch.code}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
              <Divider />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
