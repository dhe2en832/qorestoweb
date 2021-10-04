import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

const InputText = memo(
  forwardRef(
    ({ name, label, type, change, blur, value, fullWidth, disabled }, ref) => {
      const styles = {
        textField: {
          height: 33,
        },
        textLabel: {
          marginTop: '-2.5px',
        },
      };

      return (
        <Grid item xs={12}>
          <FormControl size="small" fullWidth={fullWidth}>
            <InputLabel sx={styles.textLabel} htmlFor={'textInput_' + name}>
              {label}
            </InputLabel>
            <OutlinedInput
              inputRef={ref}
              id={'textInput_' + name}
              key={'txt_inp_' + name}
              name={name}
              type={type}
              onChange={change}
              onBlur={() => blur && blur(value, name, label)}
              label={label}
              value={value}
              sx={styles.textField}
              autoComplete="off"
              disabled={disabled}
            />
          </FormControl>
        </Grid>
      );
    },
  ),
);

InputText.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  change: PropTypes.func.isRequired,
  blur: PropTypes.func,
  value: PropTypes.any,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

InputText.displayName = 'InputText';

export default InputText;
