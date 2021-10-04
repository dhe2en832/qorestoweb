import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import useResponsive from '../hooks/useResponsive';

function ModalWrapper({
  show,
  hide,
  children,
  title,
  caption,
  toolbar,
  fullScreen,
  maxWidth,
}) {
  const { mdUp } = useResponsive();
  const styles = {
    dialogTitle: {
      padding: mdUp ? '16px' : '10px',
      marginBottom: mdUp ? '-10px' : 0,
    },
    dialogContent: {
      padding: 0,
    },
    buttonClose: {
      padding: 0,
      display: 'flex',
      justifyContent: 'flex-end',
    },
  };
  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={maxWidth}
        open={show}
        onClose={hide}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title" sx={styles.dialogTitle}>
          <Box display="flex" justifyContent="space-around">
            <Typography flexGrow={1} alignSelf="center">
              {title}
            </Typography>
            <Button
              onClick={hide}
              color="error"
              size="small"
              sx={styles.buttonClose}
              tabIndex={-1}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
          <Typography component="div" variant="caption">
            {caption}
          </Typography>
          {toolbar}
        </DialogTitle>
        <DialogContent sx={styles.dialogContent}>{children}</DialogContent>
      </Dialog>
    </>
  );
}

ModalWrapper.propTypes = {
  show: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired,
  title: PropTypes.string,
  caption: PropTypes.string,
  toolbar: PropTypes.element,
  fullWidth: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};

ModalWrapper.defaultProps = {
  toolbar: <></>,
  title: '',
  caption: '',
  fullScreen: true,
  maxWidth: 'xl',
};

export default memo(ModalWrapper);
