import React, { memo, forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import InputBase from '@mui/material/InputBase';

export default memo(
  forwardRef(function InputTableText(
    { index, name, value, type, maxLength, change, blur, setIsEditItem, setWidth, disabled },
    ref
  ) {
    const styles = {
      textForm: {
        margin: 0,
      },
      textField: {
        width: setWidth ? setWidth : '13ch',
      },
    };

    return (
      <FormControl size="small" sx={styles.textForm} disabled={disabled}>
        <InputBase
          id={'textInputTable_' + name}
          key={'txt_inp_table_' + name}
          name={name}
          type={type}
          inputRef={ref}
          inputProps={{ maxLength }}
          sx={styles.textField}
          onChange={(event) => change(event, index)}
          onBlur={() => {
            blur && blur(value, index, name);
            setIsEditItem && setIsEditItem(false);
          }}
          onFocus={() => setIsEditItem && setIsEditItem(true)}
          autoComplete="off"
          multiline={true}
          value={value}
        />
      </FormControl>
    );
  })
);
