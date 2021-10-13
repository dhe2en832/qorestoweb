import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function KeySearchDialog({
  confName,
  openKeySearchDlg,
  setOpenKeySearchDlg,
  sortDataBy,
  indexKey,
  setIndexKey,
}) {
  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpenKeySearchDlg(false);
    }
  };

  const handleChange = (event) => {
    setIndexKey(parseInt(event.target.value, 10));
    handleClose();
  };

  return (
    <div>
      <Dialog disableEscapeKeyDown open={openKeySearchDlg} onClose={handleClose}>
        <DialogTitle>Urutan Tampilan {confName}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <FormControl sx={{ my: 1 }}>
              <InputLabel id="keySearchDlg-label">Pilih</InputLabel>
              <Select
                labelId="keySearchDlg-label"
                id="keySearchDlg"
                value={indexKey}
                onChange={handleChange}
                input={<OutlinedInput label="Age" />}
                autoFocus
              >
                {sortDataBy.map((data, index) => (
                  <MenuItem key={('keySearchDlg' + index).toString()} value={data.index}>
                    {data.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Batal
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
