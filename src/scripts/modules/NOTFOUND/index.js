import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import { ReactComponent as Logo } from '../../../images/404-illustration.svg';

export default function NotFound() {
  return (
    <Container maxWidth="lg">
      <Box alignItems="center">
        {/* <img
          src={}
          alt="404 The Page Was Not Found"
          style={{ width: '100%', maxHeight: '409.6px' }}
        /> */}
        <Typography textAlign="center" variant="" component="h1">
          Halaman tersebut tidak ditemukan
        </Typography>
      </Box>
    </Container>
  );
}
