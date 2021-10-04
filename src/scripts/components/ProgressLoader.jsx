import React from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

export default function ProgressLoader() {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '60vh' }}
    >
      <Grid item>
        <div>Sedang Memuat...</div>
      </Grid>
      <Grid item>
        <CircularProgress />
      </Grid>
    </Grid>
  );
}
