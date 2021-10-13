import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

export default function TextFilterDialog({
  confTextFilter,
  openTextFilterDlg,
  setOpenTextFilterDlg,
  handleTextFilter,
}) {
  const [textFilterValue, setTextFilterValue] = useState('');
  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenTextFilterDlg(false);
    }
  };

  const handleChange = (event) => {
    setTextFilterValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleTextFilter(textFilterValue);
    setOpenTextFilterDlg(false);
  };

  const handleKeyPress = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    switch (event.key) {
      case 'Enter':
        handleTextFilter(textFilterValue);
        setOpenTextFilterDlg(false);
        event.preventDefault();
        break;
      default:
        return;
    }
  };

  return (
    <div>
      <Dialog disableEscapeKeyDown open={openTextFilterDlg} onClose={handleClose}>
        <DialogTitle>Text Filter {confTextFilter}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ display: 'flex', flexWrap: 'wrap' }}
            onSubmit={(event) => event.preventDefault()}
          >
            <FormControl sx={{ my: 1 }}>
              <TextField
                id="textFilterDlg"
                label="Text Filter:"
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                value={textFilterValue}
                autoFocus
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} color="primary">
            Simpan
          </Button>
          <Button onClick={handleClose} color="error">
            Batal
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
