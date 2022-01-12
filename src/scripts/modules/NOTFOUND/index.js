import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReactComponent as Logo } from '../../../images/404-illustration.svg';

export default function NotFound() {
  return (
    <Container maxWidth="lg">
      <Box alignItems="center">
        <Logo style={{ width: '100%', maxHeight: '500px', marginTop: 30 }} />
        <Typography textAlign="center" variant="h6" fontWeight={600} component="h1" position="relative" sx={{ top: -80 }} color="secondary">
          Halaman tersebut tidak ditemukan
        </Typography>
      </Box>
    </Container>
  );
}
