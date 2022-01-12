import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useResponsive from '../hooks/useResponsive';

export default function CompanySlogan() {
  const { mdUp } = useResponsive();
  return (
    <Box>
      <Typography
        component="h2"
        variant={mdUp ? 'h6' : 'body2'}
        sx={{ color: '#fff', bgcolor: '#000', width: mdUp ? '60%' : '100%', m: '0 auto', p: 1 }}
        fontWeight={mdUp ? 500 : 400}
        align="center"
      >
        Integrated Business Applications and Quality Services
      </Typography>
    </Box>
  );
}
