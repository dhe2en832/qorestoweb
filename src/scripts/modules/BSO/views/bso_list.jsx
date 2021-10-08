import React from 'react';
import Container from '@mui/material/Container';
import ProgressLoader from '../../../components/ProgressLoader';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import KeySearchDialog from '../../../components/KeySearchDialog';
import ToolbarComplex from '../../../components/ToolbarComplex';
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
    openKeySearchDlg,
    setOpenKeySearchDlg,
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
      <KeySearchDialog
        confName={confName}
        openKeySearchDlg={openKeySearchDlg}
        setOpenKeySearchDlg={setOpenKeySearchDlg}
        sortDataBy={BSOSR}
        indexKey={indexKey}
        setIndexKey={setIndexKey}
      />
      <ToolbarComplex
        confName={confName}
        url={url}
        setOpenKeySearchDlg={setOpenKeySearchDlg}
        searchLabel={searchLabel}
        handleSearch={handleSearch}
        handleSubmitSearch={handleSubmitSearch}
      />
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
