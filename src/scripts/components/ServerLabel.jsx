import React from 'react';
import Chip from '@mui/material/Chip';
import StorageIcon from '@mui/icons-material/Storage';
import { getAppConfig } from '../utils/app-config';

/**
 * ServerLabel — chip kecil yang tampil di halaman login jika label server di-set.
 *
 * Prioritas label:
 * 1. app.cfg → server_label  (runtime, edit tanpa rebuild)
 * 2. .env    → REACT_APP_SERVER_LABEL (build time, fallback opsional)
 *
 * Untuk server cadangan, set di public/app.cfg:
 *   "server_mode": "local",
 *   "server_label": "SERVER CADANGAN"
 *
 * Tidak render apapun jika semua label kosong.
 *
 * Catatan: app.cfg sudah di-load sebelum React render (di src/index.js),
 * sehingga getAppConfig() langsung mengembalikan nilai yang benar.
 */
function ServerLabel() {
  const cfg      = getAppConfig();
  const envLabel = (process.env.REACT_APP_SERVER_LABEL || '').trim();
  const label    = (cfg.server_label || '').trim() || envLabel;

  if (!label) return null;

  const isLocal = cfg.server_mode === 'local';

  return (
    <Chip
      icon={<StorageIcon sx={{ fontSize: '14px !important' }} />}
      label={label}
      size="small"
      color={isLocal ? 'error' : 'warning'}
      variant="outlined"
      sx={{
        fontSize: '0.7rem',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        height: 22,
        borderWidth: 1.5,
      }}
    />
  );
}

export default ServerLabel;
