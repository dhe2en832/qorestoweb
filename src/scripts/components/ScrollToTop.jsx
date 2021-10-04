import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Zoom from '@mui/material/Zoom';
import useScrollTrigger from '@mui/material/useScrollTrigger';

export default function ScrollToTop({ children, anchorRef }) {
  const styles = {
    root: {
      position: 'fixed',
      bottom: '8px',
      right: '8px',
      zIndex: `99`,
    },
  };
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 80,
  });
  const handleClick = (event) => {
    event.preventDefault();
    anchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <Zoom in={trigger}>
      <Box onClick={handleClick} role="presentation" sx={styles.root}>
        {children}
      </Box>
    </Zoom>
  );
}

ScrollToTop.propTypes = {
  children: PropTypes.element.isRequired,
  anchorRef: PropTypes.object.isRequired,
};
