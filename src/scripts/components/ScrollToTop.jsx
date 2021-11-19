import React from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Zoom from '@mui/material/Zoom';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import useResponsive from '../hooks/useResponsive';

export default function ScrollToTop({ children, anchorRef }) {
  const { smUp, mdUp } = useResponsive();
  const { pathname } = useLocation();
  const checkIsForm = () => {
    if (pathname.includes('add') || pathname.includes('edit')) return true;
    else return false;
  };
  const styles = {
    root: {
      position: 'fixed',
      bottom: mdUp ? '42px' : '8px',
      right: checkIsForm() ? (mdUp ? '8px' : smUp ? '46vw' : '42vw') : '8px',
      zIndex: `99`,
    },
  };
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
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
