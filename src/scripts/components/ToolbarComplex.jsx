import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SortIcon from '@mui/icons-material/Sort';
import BackIcon from '@mui/icons-material/ArrowBack';
import FastIcon from '@mui/icons-material/Bolt';
import FilterIcon from '@mui/icons-material/FilterAlt';
import useResponsive from '../hooks/useResponsive';
import SearchBar from './SearchBar';
import { AddElem } from './ButtonActions';

export default function ToolbarComplex({
  confName,
  keyURL,
  setOpenKeySearchDlg,
  setOpenTextFilterDlg,
  searchLabel,
  search,
  handleSearch,
  handleSubmitSearch,
  isOrder,
  isFast,
  state,
  goBack,
}) {
  const { smDown } = useResponsive();
  return (
    <Grid container alignItems="center" justifyContent="flex-end" spacing={1}>
      <Grid
        item
        container
        xs={12}
        md={isFast ? 12 : 6}
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid item xs={isFast ? 12 : 'auto'} md={'auto'}>
          <Typography variant="h6" component="h1">
            {isOrder && (
              <>
                Order <span>&#8594;</span> {confName}
              </>
            )}
            {!isOrder && <>Master {confName}</>}
          </Typography>
        </Grid>{' '}
        {isFast && (
          <Grid item xs={6} md={isFast ? 4 : 'auto'}>
            <Button
              onClick={() => {
                goBack && goBack();
              }}
              variant="outlined"
              color="error"
              size="small"
              fullWidth
            >
              <BackIcon />
            </Button>
          </Grid>
        )}
        <Grid item xs={isFast ? 6 : 'auto'} md={isFast ? 4 : 'auto'}>
          <AddElem url={keyURL} title={confName} state={state} fullWidth={isFast} />
        </Grid>
      </Grid>
      {isFast === false && (
        <Grid
          xs={12}
          md={6}
          item
          container
          justifyContent={smDown ? 'flex-start' : 'flex-end'}
          alignItems="center"
        >
          <Grid container item xs={smDown ? 5 : 'auto'}>
            <Grid item>
              <IconButton component={Link} to={{ pathname: `${keyURL}/fast`, state: {} }}>
                <FastIcon color="primary" size={smDown ? 'small' : 'large'} />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton onClick={() => setOpenKeySearchDlg(true)}>
                <SortIcon color="primary" size={smDown ? 'small' : 'large'} />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton onClick={() => (setOpenTextFilterDlg ? setOpenTextFilterDlg(true) : {})}>
                <FilterIcon color="primary" size={smDown ? 'small' : 'large'} />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item xs={smDown ? 7 : 'auto'}>
            <SearchBar
              name="searchBar_list"
              label={searchLabel}
              value={search}
              change={handleSearch}
              submit={handleSubmitSearch}
            />
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
