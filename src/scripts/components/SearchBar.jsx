import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

function SearchBar({ name, label, change, submit }) {
  const styles = {
    textField: {
      height: 33,
    },
    textLabel: {
      marginTop: '-2.5px',
    },
  };

  const handleKeyPress = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    switch (event.key) {
      case 'Enter':
        submit();
        event.preventDefault();
        break;
      default:
        return;
    }
  };

  return (
    <Grid item xs={12}>
      <FormControl size="small">
        <InputLabel sx={styles.textLabel} htmlFor={'textSearchInput_' + name}>
          {label}
        </InputLabel>
        <OutlinedInput
          id={'textSearchInput_' + name}
          key={'txt_search_inp_' + name}
          name={name}
          type={'text'}
          label={label}
          sx={styles.textField}
          onChange={change}
          onKeyPress={handleKeyPress}
          autoComplete="off"
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={`Search Input for ${label}`}
                onClick={submit}
                onMouseDown={submit}
                edge="end"
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Grid>
  );
}

SearchBar.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  change: PropTypes.func.isRequired,
};

export default SearchBar;
