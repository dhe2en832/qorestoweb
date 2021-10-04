import React, { memo } from 'react';
import Typography from '@mui/material/Typography';

export default memo(function DataNotFound({ keyName }) {
  return (
    <Typography variant="caption" color="textSecondary">
      Data {keyName} tidak ditemukan pada database.
    </Typography>
  );
});
