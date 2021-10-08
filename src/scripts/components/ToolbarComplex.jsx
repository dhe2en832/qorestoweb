import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SortIcon from '@mui/icons-material/Sort';
import useResponsive from '../hooks/useResponsive';
import SearchBar from './SearchBar';
import { AddElem } from './ButtonActions';

export default function ToolbarComplex({
  confName,
  url,
  setOpenKeySearchDlg,
  searchLabel,
  handleSearch,
  handleSubmitSearch,
}) {
  const { mdDown } = useResponsive();
  return (
    <Grid container alignItems="center" justifyContent="flex-end" spacing={1}>
      <Grid
        item
        container
        xs={12}
        md={6}
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid item>
          <Typography variant="h6" component="h1">
            Master {confName}
          </Typography>
        </Grid>{' '}
        <Grid item>
          <AddElem url={url} title={confName} />
        </Grid>
      </Grid>
      <Grid
        xs={12}
        md={6}
        item
        container
        justifyContent={mdDown ? 'space-between' : 'flex-end'}
        alignItems="center"
      >
        <Grid item>
          <IconButton onClick={() => setOpenKeySearchDlg(true)}>
            <SortIcon color="primary" size="large" />
          </IconButton>
        </Grid>
        <Grid item>
          <SearchBar
            name="searchBar_list"
            label={searchLabel}
            change={handleSearch}
            submit={handleSubmitSearch}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
