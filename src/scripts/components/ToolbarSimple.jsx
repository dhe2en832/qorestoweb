import React, { memo } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import SearchBar from './SearchBar';

function ToolbarSimple({
  showAdd,
  showSwitch,
  catalog,
  setCatalog,
  setSearch,
  setSearchLabel,
  setSubmitSearch,
  onClickAdd,
}) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
      {showAdd && (
        <Grid item xs={3}>
          <Button variant="contained" color="primary" size="small" onClick={onClickAdd}>
            <AddIcon />
          </Button>
        </Grid>
      )}
      <Grid item container xs={showAdd ? 9 : 12} justifyContent={smUp ? 'flex-end' : 'flex-start'}>
        <Grid item>
          {showSwitch && (
            <FormControlLabel
              control={<Switch checked={catalog} onChange={() => setCatalog(!catalog)} />}
              label={'Catalog View'}
            />
          )}
        </Grid>
        <Grid item>
          <SearchBar
            name="searchLookup"
            label={setSearchLabel}
            change={setSearch}
            submit={setSubmitSearch}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

ToolbarSimple.defaultProps = {
  showSwitch: true,
  showAdd: true,
  catalog: () => {},
};

export default memo(ToolbarSimple);
