import React, { memo, forwardRef } from 'react';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

export default memo(
  forwardRef(function InputCardTextComplex(
    {
      index,
      name,
      label,
      nextFocus,
      value,
      type,
      maxLength,
      change,
      blur,
      enterEvent,
      disabled,
      fullWidth,
      setIsEditItem,
    },
    ref
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
          enterEvent && enterEvent(index, name);
          event.preventDefault();
          break;
        default:
          return;
      }
    };
    return (
      <Grid item container xs={12}>
        <FormControl size="small" fullWidth={fullWidth} disabled={disabled}>
          <InputLabel sx={styles.textLabel} htmlFor={'textInput_' + name}>
            {label}
          </InputLabel>
          <OutlinedInput
            id={'textInputCardCmplx_' + name}
            key={'txt_inp_card_cpx' + name}
            inputRef={ref}
            name={name}
            type={type}
            inputProps={{ maxLength }}
            onChange={(event) => change(event, index)}
            onBlur={() => {
              blur && blur(value, index, name, nextFocus, label);
              setIsEditItem && setIsEditItem(false);
            }}
            onFocus={() => setIsEditItem && setIsEditItem(true)}
            onKeyPress={handleKeyPress}
            label={label}
            value={value}
            sx={styles.textField}
            autoComplete="off"
            multiline={false}
          />
        </FormControl>
      </Grid>
    );
  })
);
