import React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ProgressLoader from '../../../components/ProgressLoader';
import SearchBar from '../../../components/SearchBar';
import { AddElem } from '../../../components/ButtonActions';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import useTableLists from '../../../hooks/useTableLists';

import bso_api from '../controller/bso_api';
import { confPrimKey, confName } from '../model/bso_config';
import { headCells, bodyCells } from '../model/bso_table';
import { BSOSR } from '../model/bso_sort';

export default function BSOList() {
  const {
    url,
    loading,
    searchLabel,
    handleSearch,
    handleSubmitSearch,
    indexKey,
    setIndexKey,
    lists,
    listCount,
    setListCount,
    setOffset,
    limit,
    setLimit,
    page,
    setPage,
  } = useTableLists({
    dataSource: bso_api,
    headCells,
    confPrimKey,
    confName,
    sortDataBy: BSOSR,
  });

  return (
    <Container maxWidth="xl">
      <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
        <Grid item>
          <Typography variant="h6" component="h1">
            Master {confName}
          </Typography>
        </Grid>
        <Grid item>
          <AddElem url={url} title={confName} />
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
      {loading ? (
        <ProgressLoader />
      ) : (
        <TableWrapperComplex
          keyName={confName}
          keyID={confPrimKey}
          keyURL={url}
          headCells={headCells}
          bodyCells={bodyCells}
          lists={lists}
          listCount={listCount}
          setListCount={setListCount}
          setOffset={setOffset}
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          isLookup={false}
          handleDelete={() => {}}
        />
      )}
    </Container>
  );
}
