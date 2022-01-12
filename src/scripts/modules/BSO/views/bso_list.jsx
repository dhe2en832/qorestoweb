import React from 'react';
import Container from '@mui/material/Container';
import ProgressLoader from '../../../components/ProgressLoader';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import TableWrapperComplexResizer from '../../../components/TableWrapperComplexResizer';
import TableWrapperComplexDynamic from '../../../components/TableWrapperComplexDynamic';
import TableWrapperComplexDynamicResizer from '../../../components/TableWrapperComplexDynamicResizer';
import KeySearchDialog from '../../../components/KeySearchDialog';
import TextFilterDialog from '../../../components/TextFilterDialog';
import ToolbarComplex from '../../../components/ToolbarComplex';
import useTableListsDynamicResizer from '../../../hooks/useTableListsDynamicResizer';
import useResponsive from '../../../hooks/useResponsive';

import bso_api from '../controllers/bso_api';
import { tableName, confPrimKey, confName } from '../models/bso_config';
import { headCells, bodyCells } from '../models/bso_table';
import { BSOSR } from '../models/bso_sort';

export default function BSOList() {
  const { smUp } = useResponsive();
  const {
    url,
    loading,
    searchLabel,
    search,
    handleSearch,
    handleSubmitSearch,
    openKeySearchDlg,
    setOpenKeySearchDlg,
    indexKey,
    setIndexKey,
    textFilter,
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
    columnResize,
    setColumnWidth,
  } = useTableListsDynamicResizer({
    dataSource: bso_api,
    headCells,
    tableName,
    confPrimKey,
    confName,
    sortDataBy: BSOSR,
    textFilterInit: '',
    keySearchInit: '',
    optionsToShow: true,
  });

  return (
    <Container maxWidth="xl" sx={{ mt: smUp ? 7 : 5 }}>
      <KeySearchDialog
        confName={confName}
        openKeySearchDlg={openKeySearchDlg}
        setOpenKeySearchDlg={setOpenKeySearchDlg}
        sortDataBy={BSOSR}
        indexKey={indexKey}
        setIndexKey={setIndexKey}
      />
      <TextFilterDialog
        initTextFilter={textFilter}
        confTextFilter={'Nama Customer (x)'}
        openTextFilterDlg={openTextFilterDlg}
        setOpenTextFilterDlg={setOpenTextFilterDlg}
        handleTextFilter={handleTextFilter}
      />
      <ToolbarComplex
        confName={confName}
        keyURL={url}
        setOpenKeySearchDlg={setOpenKeySearchDlg}
        setOpenTextFilterDlg={setOpenTextFilterDlg}
        searchLabel={searchLabel}
        search={search}
        handleSearch={handleSearch}
        handleSubmitSearch={handleSubmitSearch}
        isOrder={true}
        isFast={false}
      />
      {loading ? (
        <ProgressLoader />
      ) : useBRWDEF ? (
        smUp ? (
          <TableWrapperComplexDynamicResizer
            keyName={confName}
            keyURL={url}
            lists={lists}
            listCount={listCount}
            setListCount={setListCount}
            setOffset={setOffset}
            limit={limit}
            setLimit={setLimit}
            page={page}
            setPage={setPage}
            isLookup={false}
            dense={dense}
            setDense={setDense}
            tableName={tableName}
            setColumnWidth={setColumnWidth}
            columnResize={columnResize}
          />
        ) : (
          <TableWrapperComplexDynamic
            keyName={confName}
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
            dense={dense}
            setDense={setDense}
          />
        )
      ) : smUp ? (
        <TableWrapperComplexResizer
          keyName={confName}
          keyURL={url}
          lists={lists}
          listCount={listCount}
          setListCount={setListCount}
          setOffset={setOffset}
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          isLookup={false}
          dense={dense}
          setDense={setDense}
          tableName={tableName}
          setColumnWidth={setColumnWidth}
          columnResize={columnResize}
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
          dense={dense}
          setDense={setDense}
        />
      )}
    </Container>
  );
}
