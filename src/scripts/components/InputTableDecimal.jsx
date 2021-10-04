import React, { memo, forwardRef } from 'react';
import NumberFormat from 'react-number-format';
import FormControl from '@mui/material/FormControl';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import MinusIcon from '@mui/icons-material/Remove';
import PlusIcon from '@mui/icons-material/Add';

const InputTableDecimal = memo(
  forwardRef(
    (
      {
        index,
        name,
        value,
        change,
        blur,
        increase,
        decrease,
        step,
        setIsEditItem,
      },
      ref,
    ) => {
      const styles = {
        decimalForm: {
          margin: 0,
        },
        decimalField: {
          width: '13ch',
        },
        decimalInput: {
          textAlign: 'center',
        },
      };
      const handleKeyPress = (event) => {
        if (event.defaultPrevented) {
          return;
        }
        switch (event.key) {
          case 'Up':
          case 'ArrowUp':
            increase(name, step, index);
            break;
          case 'Down':
          case 'ArrowDown':
            decrease(name, step, index);
            break;
          default:
            return;
        }
        event.preventDefault();
      };

      return (
        <FormControl size="small" sx={styles.decimalForm}>
          <NumberFormat
            sx={styles.decimalField}
            inputRef={ref}
            inputProps={{ sx: styles.decimalInput }}
            id={'decimalInputTable_' + name}
            key={'dcml_inp_table_' + name}
            name={name}
            decimalScale={2}
            fixedDecimalScale={true}
            autoComplete="off"
            customInput={InputBase}
            onBlur={() => {
              blur && blur(value, index, name);
              setIsEditItem(false);
            }}
            onFocus={() => setIsEditItem(true)}
            onKeyDown={handleKeyPress}
            onChange={(event) => change(event, index)}
            startAdornment={
              <InputAdornment
                position={'start'}
                onBlur={() => {
                  blur && blur(value, index, name);
                  setIsEditItem(false);
                }}
                onFocus={() => setIsEditItem(true)}
              >
                <IconButton
                  edge="start"
                  onClick={() => decrease(name, step, index)}
                  aria-label={'decimal-input-table-decrease-icon-' + name}
                >
                  <MinusIcon fontSize="small" color="error" />
                </IconButton>
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment
                position="end"
                onBlur={() => {
                  blur && blur(value, index, name);
                  setIsEditItem(false);
                }}
                onFocus={() => setIsEditItem(true)}
              >
                <IconButton
                  edge="end"
                  onClick={() => increase(name, step, index)}
                  aria-label={'decimal-input-table-increase-icon-' + name}
                >
                  <PlusIcon fontSize="small" color="primary" />
                </IconButton>
              </InputAdornment>
            }
            value={value}
          />
        </FormControl>
      );
    },
  ),
);

InputTableDecimal.defaultProps = {
  step: 1.0,
  increase: () => {},
  decrease: () => {},
  change: () => {},
  blur: () => {},
};

InputTableDecimal.displayName = 'InputTableDecimal';

export default InputTableDecimal;
