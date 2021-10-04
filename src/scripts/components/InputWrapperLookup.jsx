import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useResponsive from '../hooks/useResponsive';

function InputWrapperLookup({ children, lookup }) {
  const { mdUp } = useResponsive();
  const styles = {
    multiLineEllipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },
  };
  return (
    <Grid item container spacing={mdUp ? 1 : 0}>
      <Grid item xs={12} md={8}>
        {children}
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography sx={styles.multiLineEllipsis} variant="caption" color="secondary">
          {lookup ? lookup : ' ( - ) '}
        </Typography>
      </Grid>
    </Grid>
  );
}

InputWrapperLookup.propTypes = {
  children: PropTypes.element.isRequired,
  lookup: PropTypes.string.isRequired,
};

export default InputWrapperLookup;
