import React from 'react';
import Typography from '@mui/material/Typography';
import useResponsive from '../hooks/useResponsive';

export default function CompanyName() {
  const { mdUp } = useResponsive();
  return (
    <Typography component="h1" variant={mdUp ? 'h4' : 'h6'} sx={{ fontWeight: 600 }} align="center">
      Citra Sabda Abadi{' '}
      <Typography
        component="span"
        variant={mdUp ? 'h6' : 'body1'}
        sx={{ color: '#513474', fontStyle: 'italic' }}
      >
        {' '}
        computer
      </Typography>
    </Typography>
  );
}
