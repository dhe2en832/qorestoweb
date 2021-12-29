import React, { memo, forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import InputBase from '@mui/material/InputBase';

export default memo(
  forwardRef(function InputTableTextComplex(
    {
      index,
      name,
      nextFocus,
      value,
      type,
      maxLength,
      change,
      blur,
      enterEvent,
      setWidth,
      setIsEditItem,
      disabled,
    },
    ref
  ) {
    const styles = {
      textForm: {
        margin: 0,
      },
      textField: {
        width: setWidth ? setWidth : '13ch',
        fontSize: '0.875rem',
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
      <FormControl size="small" sx={styles.textForm} disabled={disabled}>
        <InputBase
          id={'textInputTableCmplx_' + name}
          key={'txt_inp_table_cpx_' + name}
          name={name}
          type={type}
          inputRef={ref}
          inputProps={{ maxLength }}
          sx={styles.textField}
          onChange={(event) => change(event, index)}
          onBlur={() => {
            blur && blur(value, index, name, nextFocus);
            setIsEditItem && setIsEditItem(false);
          }}
          onFocus={() => setIsEditItem && setIsEditItem(true)}
          onKeyPress={handleKeyPress}
          autoComplete="off"
          multiline={true}
          value={value}
        />
      </FormControl>
    );
  })
);
