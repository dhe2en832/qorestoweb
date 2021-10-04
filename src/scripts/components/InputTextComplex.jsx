import React, { memo, forwardRef } from 'react';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

function InputTextComplex(
  {
    name,
    nextFocus,
    label,
    type,
    change,
    blur,
    value,
    dataSrc,
    enterEvent,
    fullWidth,
    disabled,
  },
  ref,
) {
  const styles = {
    textField: {
      height: 33,
    },
    textLabel: {
      marginTop: '-2.5px',
    },
  };

  const handleKeyPress = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    switch (event.key) {
      case 'Enter':
        enterEvent && enterEvent(name, nextFocus);
        event.preventDefault();
        break;
      default:
        return;
    }
  };

  return (
    <Grid item xs={12}>
      <FormControl size="small" fullWidth={fullWidth}>
        <InputLabel sx={styles.textLabel} htmlFor={'textInput_' + name}>
          {label}
        </InputLabel>
        <OutlinedInput
          id={'textInputCmplx_' + name}
          key={'txt_inp_cpx_' + name}
          inputRef={ref}
          name={name}
          type={type}
          onChange={change}
          onBlur={() => blur && blur(value, name, label, nextFocus, dataSrc)}
          onKeyPress={handleKeyPress}
          label={label}
          value={value}
          sx={styles.textField}
          autoComplete="off"
          disabled={disabled}
        />
      </FormControl>
    </Grid>
  );
}

export default memo(forwardRef(InputTextComplex));
