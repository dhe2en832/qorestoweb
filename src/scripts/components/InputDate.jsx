import React, { memo, forwardRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import DatePicker from '@mui/lab/DatePicker';
import AdapterMoment from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

function InputDate({ label, name, value, change, blur, autoFocus, disabled }, ref) {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const styles = {
    datepickerField: {
      height: 33,
      width: '19ch',
      '& .MuiInputBase-input': {
        padding: '5px 13px',
      },
    },
    datepickerIcon: {
      '& .MuiInputLabel-formControl .MuiIconButton-root': { padding: 0 },
    },
  };
  return (
    <Grid item xs={12}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DatePicker
          inputRef={ref}
          inputFormat="DD/MM/YYYY"
          label={label}
          size="small"
          name={name}
          renderInput={(params) => (
            <TextField
              id={'dateInput_' + name}
              key={'dt_inp_' + name}
              {...params}
              InputLabelProps={{
                shrink: true,
              }}
              onBlur={() => blur && isDateOpen === false && blur(value, name, label)}
              autoFocus={autoFocus || false}
            />
          )}
          InputProps={{
            sx: styles.datepickerField,
          }}
          InputAdornmentProps={{
            position: 'end',
            sx: styles.datepickerIcon,
            onBlur: () => blur && isDateOpen === false && blur(value, name, label),
          }}
          onChange={(date) => change(date, name)}
          onOpen={() => setIsDateOpen(true)}
          onClose={() => setIsDateOpen(false)}
          value={value}
          disabled={disabled}
        />
      </LocalizationProvider>
    </Grid>
  );
}

export default memo(forwardRef(InputDate));
