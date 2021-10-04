import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

const InputCurrency = memo(
  forwardRef(
    (
      { label, name, change, blur, prefix, value, fullWidth, setIsEditHeader },
      ref,
    ) => {
      const styles = {
        currencyForm: {
          margin: 0,
        },
        currencyField: {
          height: 33,
        },
        currencyInput: {
          textAlign: 'right',
        },
        currencyLabel: {
          marginTop: '-2.5px',
        },
      };
      return (
        <Grid item xs={12}>
          <FormControl
            variant="outlined"
            size="small"
            sx={styles.currencyForm}
            fullWidth={fullWidth}
          >
            <InputLabel
              sx={styles.currencyLabel}
              htmlFor={'currencyInput' + name}
            >
              {label}
            </InputLabel>
            <NumberFormat
              id={'currencyInput_' + name}
              key={'crncy_inp_' + name}
              name={name}
              label={label}
              inputProps={{ sx: styles.currencyInput }}
              inputRef={ref}
              sx={styles.currencyField}
              thousandSeparator={true}
              type="tel"
              decimalScale={2}
              fixedDecimalScale={true}
              prefix={prefix}
              autoComplete="off"
              customInput={OutlinedInput}
              onValueChange={(values) => change(values, name)}
              onBlur={() => {
                blur && blur(value, name);
                setIsEditHeader && setIsEditHeader(false);
              }}
              onFocus={() => setIsEditHeader && setIsEditHeader(true)}
              value={value}
            />
          </FormControl>
        </Grid>
      );
    },
  ),
);

InputCurrency.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  change: PropTypes.func.isRequired,
  blur: PropTypes.func,
  prefix: PropTypes.any,
  value: PropTypes.any,
  fullWidth: PropTypes.bool,
};

InputCurrency.displayName = 'InputCurrency';

export default InputCurrency;
