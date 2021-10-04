import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useResponsive from '../hooks/useResponsive';

export default function CompanySlogan() {
  const { mdUp } = useResponsive();
  return (
    <Box mt={2} p={2} bgcolor="black">
      <Typography
        component="h2"
        variant={mdUp ? 'h5' : 'body1'}
        sx={{ color: '#fff' }}
        align="center"
      >
        Integrated Business Applications and Quality Services
      </Typography>
    </Box>
  );
}
