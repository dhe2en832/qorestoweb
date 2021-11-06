import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

const InputCardCurrency = memo(
  forwardRef(
    (
      {
        index,
        label,
        name,
        change,
        blur,
        prefix,
        value,
        fullWidth,
        setWidth,
        setIsEditItem,
        disabled,
      },
      ref
    ) => {
      const styles = {
        currencyForm: {
          margin: 0,
        },
        currencyField: {
          height: 33,
          ...(setWidth && { width: setWidth }),
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
            disabled={disabled}
          >
            <InputLabel sx={styles.currencyLabel} htmlFor={'currencyInputCard' + name}>
              {label}
            </InputLabel>
            <NumberFormat
              id={'currencyInputCard_' + name}
              key={'crncy_inp_card_' + name}
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
              onValueChange={(values) => change(values, name, index)}
              onBlur={() => {
                blur && blur(value, index, name, label);
                setIsEditItem && setIsEditItem(false);
              }}
              onFocus={() => setIsEditItem && setIsEditItem(true)}
              value={value}
            />
          </FormControl>
        </Grid>
      );
    }
  )
);

InputCardCurrency.defaultProps = {
  prefix: '',
  change: () => {},
};

InputCardCurrency.propTypes = {
  index: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  change: PropTypes.func.isRequired,
  blur: PropTypes.func,
  prefix: PropTypes.any,
  value: PropTypes.any,
  fullWidth: PropTypes.bool,
};

InputCardCurrency.displayName = 'InputCardCurrency';

export default InputCardCurrency;
