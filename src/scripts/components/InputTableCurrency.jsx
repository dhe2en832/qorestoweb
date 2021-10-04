import React, { memo, forwardRef } from 'react';
import NumberFormat from 'react-number-format';
import InputBase from '@mui/material/InputBase';
import FormControl from '@mui/material/FormControl';

const InputTableCurrency = memo(
  forwardRef(
    ({ index, name, value, change, blur, prefix, setIsEditItem }, ref) => {
      const styles = {
        currencyForm: {
          margin: 0,
        },
        currencyField: {
          width: '13ch',
        },
        currencyInput: {
          textAlign: 'right',
        },
      };
      return (
        <FormControl size="small" sx={styles.currencyForm}>
          <NumberFormat
            sx={styles.currencyField}
            inputRef={ref}
            inputProps={{ sx: styles.currencyInput }}
            id={'currencyInputTable_' + name}
            key={'crncy_inp_table_' + name}
            name={name}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
            prefix={prefix}
            autoComplete="off"
            customInput={InputBase}
            onBlur={() => {
              blur && blur(value, index, name);
              setIsEditItem && setIsEditItem(false);
            }}
            onFocus={() => setIsEditItem && setIsEditItem(true)}
            size="sm"
            type="tel"
            onValueChange={(values) => change(values, name, index)}
            value={value}
          />
        </FormControl>
      );
    },
  ),
);

InputTableCurrency.defaultProps = {
  prefix: '',
  change: () => {},
};

InputTableCurrency.displayName = 'InputTableCurrency';

export default InputTableCurrency;
