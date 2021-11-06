import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import MinusIcon from '@mui/icons-material/Remove';
import PlusIcon from '@mui/icons-material/Add';

const InputDecimal = memo(
  forwardRef(
    (
      {
        label,
        name,
        value,
        change,
        blur,
        increase,
        decrease,
        placeholder,
        step,
        decimalScale,
        fixedDecimalScale,
        setIsEditHeader,
        disabled,
      },
      ref
    ) => {
      const styles = {
        decimalInput: {
          height: 33,
        },
        decimalLabel: {
          marginTop: '-2.5px',
        },
        decimalField: {
          maxWidth: '80%',
          minWidth: '15ch',
        },
      };
      const handleKeyPress = (event) => {
        if (event.defaultPrevented) {
          return;
        }
        switch (event.key) {
          case 'Up':
          case 'ArrowUp':
            increase(name, step);
            break;
          case 'Down':
          case 'ArrowDown':
            decrease(name, step);
            break;
          default:
            return;
        }
        event.preventDefault();
      };

      return (
        <Grid item xs={12}>
          <FormControl sx={styles.decimalField} variant="outlined" size="small" disabled={disabled}>
            <InputLabel sx={styles.decimalLabel} htmlFor={'decimalInput_' + name}>
              {label}
            </InputLabel>
            <NumberFormat
              inputRef={ref}
              id={'decimalInput_' + name}
              key={'dcml_inp_' + name}
              name={name}
              label={label}
              type="tel"
              sx={styles.decimalInput}
              decimalScale={decimalScale}
              fixedDecimalScale={fixedDecimalScale}
              autoComplete="off"
              customInput={OutlinedInput}
              onBlur={() => {
                blur && blur(value, name);
                setIsEditHeader && setIsEditHeader(false);
              }}
              onFocus={() => setIsEditHeader && setIsEditHeader(true)}
              onKeyDown={handleKeyPress}
              onChange={change}
              value={value}
              placeholder={placeholder}
              endAdornment={
                <InputAdornment
                  position="end"
                  onBlur={() => {
                    blur && blur(value, name);
                    setIsEditHeader && setIsEditHeader(false);
                  }}
                  onFocus={() => setIsEditHeader && setIsEditHeader(true)}
                >
                  <IconButton
                    edge="start"
                    onClick={() => decrease(name, step)}
                    aria-label={'decimal-input-decrease-icon-' + name}
                    disabled={disabled}
                  >
                    <MinusIcon fontSize="small" color={disabled ? 'disabled' : 'error'} />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => increase(name, step)}
                    aria-label={'decimal-input-increase-icon-' + name}
                    disabled={disabled}
                  >
                    <PlusIcon fontSize="small" color={disabled ? 'disabled' : 'primary'} />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
      );
    }
  )
);

InputDecimal.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  change: PropTypes.func.isRequired,
  blur: PropTypes.func,
  placeholder: PropTypes.string,
  step: PropTypes.number.isRequired,
  increase: PropTypes.func.isRequired,
  decrease: PropTypes.func.isRequired,
  setIsEditHeader: PropTypes.func,
  disabled: PropTypes.bool,
};

InputDecimal.defaultProps = {
  step: 1.0,
  increase: () => {},
  decrease: () => {},
  decimalScale: 2,
  fixedDecimalScale: true,
  disabled: false,
};

InputDecimal.displayName = 'InputDecimal';

export default InputDecimal;
