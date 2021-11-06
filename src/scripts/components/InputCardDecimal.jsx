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

const InputCardDecimal = memo(
  forwardRef(
    (
      {
        index,
        name,
        label,
        value,
        change,
        blur,
        increase,
        decrease,
        placeholder,
        step,
        decimalScale,
        fixedDecimalScale,
        setWidth,
        setIsEditItem,
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
          ...(setWidth
            ? { width: setWidth }
            : {
                maxWidth: '80%',
                minWidth: '15ch',
              }),
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
        <Grid item xs={12}>
          <FormControl sx={styles.decimalField} variant="outlined" size="small">
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
                blur && blur(value, index, name, label);
                setIsEditItem && setIsEditItem(false);
              }}
              onFocus={() => setIsEditItem && setIsEditItem(true)}
              onKeyDown={handleKeyPress}
              onChange={(event) => change(event, index)}
              value={value}
              placeholder={placeholder}
              endAdornment={
                <>
                  <InputAdornment
                    position="start"
                    onBlur={() => {
                      blur && blur(value, index, name, label);
                      setIsEditItem && setIsEditItem(false);
                    }}
                    onFocus={() => setIsEditItem && setIsEditItem(true)}
                  >
                    <IconButton
                      edge="start"
                      onClick={(event) => {
                        decrease(name, step, index);
                        event.preventDefault();
                      }}
                      aria-label={'decimal-input-decrease-icon-' + name}
                      disabled={disabled}
                    >
                      <MinusIcon fontSize="small" color={disabled ? 'disabled' : 'error'} />
                    </IconButton>
                  </InputAdornment>
                  <InputAdornment
                    position="end"
                    onBlur={() => {
                      blur && blur(value, index, name, label);
                      setIsEditItem && setIsEditItem(false);
                    }}
                    onFocus={() => setIsEditItem && setIsEditItem(true)}
                  >
                    <IconButton
                      edge="end"
                      onClick={(event) => {
                        increase(name, step, index);
                        event.preventDefault();
                      }}
                      aria-label={'decimal-input-increase-icon-' + name}
                      disabled={disabled}
                    >
                      <PlusIcon fontSize="small" color={disabled ? 'disabled' : 'primary'} />
                    </IconButton>
                  </InputAdornment>
                </>
              }
            />
          </FormControl>
        </Grid>
      );
    }
  )
);

InputCardDecimal.propTypes = {
  index: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  change: PropTypes.func.isRequired,
  blur: PropTypes.func,
  placeholder: PropTypes.string,
  step: PropTypes.number.isRequired,
  increase: PropTypes.func.isRequired,
  decrease: PropTypes.func.isRequired,
  setIsEditItem: PropTypes.func,
  disabled: PropTypes.bool,
};

InputCardDecimal.defaultProps = {
  step: 1.0,
  increase: () => {},
  decrease: () => {},
  decimalScale: 2,
  fixedDecimalScale: true,
  disabled: false,
};

InputCardDecimal.displayName = 'InputCardDecimal';

export default InputCardDecimal;
