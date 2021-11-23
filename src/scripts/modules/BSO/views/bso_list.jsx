import React from 'react';
import Container from '@mui/material/Container';
import ProgressLoader from '../../../components/ProgressLoader';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import TableWrapperComplexDynamic from '../../../components/TableWrapperComplexDynamic';
import KeySearchDialog from '../../../components/KeySearchDialog';
import TextFilterDialog from '../../../components/TextFilterDialog';
import ToolbarComplex from '../../../components/ToolbarComplex';
import useTableListsDynamic from '../../../hooks/useTableListsDynamic';

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
    openTextFilterDlg,
    setOpenTextFilterDlg,
    handleTextFilter,
    columns,
    lists,
    listCount,
    setListCount,
    setOffset,
    limit,
    setLimit,
    page,
    setPage,
    dense,
    setDense,
    useBRWDEF,
  } = useTableListsDynamic({
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
      <TextFilterDialog
        confTextFilter={'Nama Customer (x)'}
        openTextFilterDlg={openTextFilterDlg}
        setOpenTextFilterDlg={setOpenTextFilterDlg}
        handleTextFilter={handleTextFilter}
      />
      <ToolbarComplex
        confName={confName}
        url={url}
        setOpenKeySearchDlg={setOpenKeySearchDlg}
        setOpenTextFilterDlg={setOpenTextFilterDlg}
        searchLabel={searchLabel}
        handleSearch={handleSearch}
        handleSubmitSearch={handleSubmitSearch}
        isOrder={true}
      />
      {loading ? (
        <ProgressLoader />
      ) : useBRWDEF ? (
        <TableWrapperComplexDynamic
          keyName={confName}
          keyID={confPrimKey}
          keyURL={url}
          columns={columns}
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
          dense={dense}
          setDense={setDense}
        />
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
          dense={dense}
          setDense={setDense}
        />
      )}
    </Container>
  );
}
