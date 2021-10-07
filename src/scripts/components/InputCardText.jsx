import React, { memo, forwardRef } from 'react';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

export default memo(
  forwardRef(function InputCardText(
    {
      index,
      name,
      label,
      value,
      type,
      maxLength,
      change,
      blur,
      disabled,
      fullWidth,
      setIsEditItem,
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
    return (
      <Grid item container xs={12}>
        <FormControl size="small" fullWidth={fullWidth}>
          <InputLabel sx={styles.textLabel} htmlFor={'textInput_' + name}>
            {label}
          </InputLabel>
          <OutlinedInput
            id={'textInputCard_' + name}
            key={'txt_inp_card_' + name}
            inputRef={ref}
            name={name}
            type={type}
            inputProps={{ maxLength }}
            onChange={(event) => change(event, index)}
            onBlur={() => {
              blur && blur(value, index, name, label);
              setIsEditItem && setIsEditItem(false);
            }}
            onFocus={() => setIsEditItem && setIsEditItem(true)}
            label={label}
            value={value}
            sx={styles.textField}
            autoComplete="off"
            multiline={false}
            disabled={disabled}
          />
        </FormControl>
      </Grid>
    );
  }),
);
