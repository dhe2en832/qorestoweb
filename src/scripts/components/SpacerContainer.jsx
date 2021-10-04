import React from 'react';
import Container from '@mui/material/Container';

export default function SpacerContainer({ mt, mb }) {
  return (
    <Container sx={{ mt, mb }}>
      <h2>&nbsp;</h2>
      <h2>&nbsp;</h2>
      <h2>&nbsp;</h2>
    </Container>
  );
}

SpacerContainer.defaultProps = {
  mt: 0,
  mb: 0,
};
