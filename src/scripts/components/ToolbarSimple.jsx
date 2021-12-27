import React, { memo } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import FilterIcon from '@mui/icons-material/FilterAlt';
import SearchBar from './SearchBar';

function ToolbarSimple({
  showAdd,
  showSwitchOpt,
  isSwitchOpt,
  setIsSwitchOpt,
  switchOptLabel,
  setSearch,
  setSearchLabel,
  setSubmitSearch,
  setOpenKeySearchDlg,
  setOpenTextFilterDlg,
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
      <Grid
        item
        container
        xs={showAdd ? 9 : 12}
        alignItems="center"
        justifyContent={smUp ? 'flex-end' : 'flex-start'}
      >
        {showSwitchOpt && (
          <Grid item>
            <FormControlLabel
              control={
                <Switch
                  checked={isSwitchOpt}
                  onChange={() => setIsSwitchOpt && setIsSwitchOpt(!isSwitchOpt)}
                />
              }
              label={switchOptLabel || ''}
            />
          </Grid>
        )}
        <Grid item>
          <IconButton onClick={() => setOpenKeySearchDlg(true)}>
            <SortIcon color="primary" size="large" />
          </IconButton>
        </Grid>
        {setOpenTextFilterDlg && (
          <Grid item>
            <IconButton onClick={() => (setOpenTextFilterDlg ? setOpenTextFilterDlg(true) : {})}>
              <FilterIcon color="primary" size="large" />
            </IconButton>
          </Grid>
        )}
        <Grid item xs={smUp ? 'auto' : 12}>
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

export default memo(ToolbarSimple);
