import React, { memo, forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default memo(
  forwardRef(function InputTableSelect(
    { index, name, label, value, change, blur, options, setIsEditItem, disabled },
    ref
  ) {
    const styles = {
      selectForm: {
        margin: 0,
      },
      selectField: {
        width: '13ch',
        border: 'none',
      },
    };
    return (
      <FormControl variant="outlined" size="small" sx={styles.selectForm} disabled={disabled}>
        <Select
          inputRef={ref}
          name={name}
          id={'selectInputTable_' + name}
          key={'slct_inp_table_' + name}
          onChange={change}
          onBlur={() => {
            blur && blur(value, index, name);
            setIsEditItem && setIsEditItem(false);
          }}
          onFocus={() => setIsEditItem && setIsEditItem(true)}
          label={label}
          sx={styles.selectField}
          value={value}
        >
          {options.map((option, index) => (
            <MenuItem
              key={('slct_inp_table_items_' + name + index).toString()}
              value={option.value}
            >
              {option.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  })
);
