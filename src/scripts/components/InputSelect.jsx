import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const InputSelect = memo(
  forwardRef(({ name, label, value, change, blur, options, disabled }, ref) => {
    const styles = {
      selectForm: {
        minWidth: 180,
        maxWidth: '100%',
      },
      selectField: {
        height: 33,
      },
      selectLabel: {
        marginTop: '-2.5px',
      },
    };
    return (
      <Grid item xs={12}>
        <FormControl variant="outlined" size="small" sx={styles.selectForm} disabled={disabled}>
          <InputLabel sx={styles.selectLabel} id={'selectInput_label_' + name}>
            {label}
          </InputLabel>
          <Select
            inputRef={ref}
            fullWidth={true}
            name={name}
            labelId={'selectInput_label_' + name}
            id={'selectInput_' + name}
            key={'slct_inp_' + name}
            onChange={change}
            onBlur={() => blur && blur(value, name)}
            label={label}
            sx={styles.selectField}
            value={value}
          >
            {options.map((option, index) => (
              <MenuItem
                key={('slct_inp_items_' + name + index).toString()}
                value={option.value}
              >
                {option.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    );
  }),
);

InputSelect.defaultProps = {
  disabled: false,
};

InputSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  change: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
};

InputSelect.displayName = 'InputSelect';

export default InputSelect;
