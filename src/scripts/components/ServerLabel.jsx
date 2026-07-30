import React from 'react';
import Chip from '@mui/material/Chip';
import StorageIcon from '@mui/icons-material/Storage';
import { getAppConfig } from '../utils/app-config';

/**
 * ServerLabel — chip kecil di halaman login untuk identifikasi server.
 *
 * Prioritas label (3 sumber, satu aktif):
 * 1. app.cfg → server_label  (runtime, edit tanpa rebuild)
 * 2. .env    → REACT_APP_SERVER_LABEL (build time, paling reliable untuk cadangan)
 *
 * Tidak render apapun jika semua kosong (server utama normal).
 */
function ServerLabel() {
  const cfg = getAppConfig();

  // Prioritas: app.cfg runtime → env build time
  const cfgLabel = (cfg.server_label || '').trim();
  const envLabel = (process.env.REACT_APP_SERVER_LABEL || '').trim();
  const label    = cfgLabel || envLabel;

  // Deteksi server cadangan: dari app.cfg server_mode ATAU env SERVER_MODE
  const cfgIsLocal  = cfg.server_mode === 'local';
  const envIsLocal  = (process.env.REACT_APP_SERVER_MODE || '').toLowerCase() === 'cadangan';
  const isLocal     = cfgIsLocal || envIsLocal;

  if (!label) return null;

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
