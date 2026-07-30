import React, { useState, useEffect } from 'react';
import Chip from '@mui/material/Chip';
import StorageIcon from '@mui/icons-material/Storage';
import { getAppConfig, loadAppConfig } from '../utils/app-config';

/**
 * ServerLabel — chip kecil yang tampil di halaman login jika server label di-set.
 *
 * Prioritas label:
 * 1. app.cfg → server_label  (runtime, bisa ubah tanpa rebuild)
 * 2. .env    → REACT_APP_SERVER_LABEL (build time, fallback — opsional)
 *
 * Untuk server cadangan, set di public/app.cfg:
 *   "server_mode": "local",
 *   "server_label": "SERVER CADANGAN"
 *
 * Tidak render apapun jika semua label kosong.
 */
function ServerLabel() {
  const [cfg, setCfg] = useState(() => getAppConfig());

  useEffect(() => {
    // Paksa load ulang app.cfg agar dapat nilai terbaru
    loadAppConfig().then((c) => setCfg({ ...c }));
  }, []);

  const envLabel  = (process.env.REACT_APP_SERVER_LABEL || '').trim();
  const cfgLabel  = (cfg.server_label || '').trim();
  const label     = cfgLabel || envLabel;

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
