import React, { memo } from 'react';
import ProgressLoader from '../../../components/ProgressLoader';
import ModalWrapper from '../../../components/ModalWrapper';
import ToolbarSimple from '../../../components/ToolbarSimple';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import TableWrapperComplexResizer from '../../../components/TableWrapperComplexResizer';
import TableWrapperComplexDynamic from '../../../components/TableWrapperComplexDynamic';
import TableWrapperComplexDynamicResizer from '../../../components/TableWrapperComplexDynamicResizer';
import AlertContainer from '../../../components/AlertContainer';
import KeySearchDialog from '../../../components/KeySearchDialog';
import useTableListsLookupDynamicResizer from '../../../hooks/useTableListsLookupDynamicResizer';
import useResponsive from '../../../hooks/useResponsive';

import bwhse_api from '../controllers/bwhse_api';
import { headCells, bodyCells } from '../models/bwhse_table';
import { tableName, confName, confPrimKey, confSecKey } from '../models/bwhse_config';
import { BWHSESR } from '../models/bwhse_sort';

export default memo(function BSALESPLookup({
  lookup,
  abortLookup,
  getChoosed,
  isLoginPopup,
  handleOpenLoginPopup,
}) {
  const { smUp } = useResponsive();
  const {
    idElemLookup,
    loading,
    searchLabel,
    handleSearch,
    handleSubmitSearch,
    openKeySearchDlg,
    setOpenKeySearchDlg,
    indexKey,
    setIndexKey,
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
  } = useTableListsLookupDynamicResizer({
    dataSource: bwhse_api,
    headCells,
    confPrimKey,
    confSecKey,
    confName,
    sortDataBy: BWHSESR,
    isLoginPopup,
    handleOpenLoginPopup,
    keySearchInit: '',
    textFilterInit: '',
    lookup
  });

  return (
    <ModalWrapper
      fullScreen={false}
      maxWidth={"xl"}
      show={lookup.show}
      hide={abortLookup}
      title={`DAFTAR ${confName.toUpperCase()}`}
      caption={`Pilih salah satu ${confName} pada table untuk melanjutkan!`}
      toolbar={
        <ToolbarSimple
          setSearch={handleSearch}
          setSubmitSearch={handleSubmitSearch}
          setSearchLabel={searchLabel}
          setOpenKeySearchDlg={setOpenKeySearchDlg}
        />
      }
    >
      <>
        <KeySearchDialog
          confName={confName}
          openKeySearchDlg={openKeySearchDlg}
          setOpenKeySearchDlg={setOpenKeySearchDlg}
          sortDataBy={BWHSESR}
          indexKey={indexKey}
          setIndexKey={setIndexKey}
        />
        <AlertContainer idElem={idElemLookup} />
        {loading ? (
          <ProgressLoader />
        ) : useBRWDEF ?
          (
            smUp ? (
              <TableWrapperComplexDynamicResizer
                keyName={confName}
                lists={lists}
                listCount={listCount}
                setListCount={setListCount}
                setOffset={setOffset}
                limit={limit}
                setLimit={setLimit}
                page={page}
                setPage={setPage}
                isLookup={true}
                lookupFunc={getChoosed}
                dense={dense}
                setDense={setDense}
                tableName={tableName}
                columnResize={columnResize}
                setColumnWidth={setColumnWidth}
              />
            ) : (
              <TableWrapperComplexDynamic
                keyName={confName}
                keyID={confPrimKey}
                columns={columns}
                lists={lists}
                listCount={listCount}
                setListCount={setListCount}
                setOffset={setOffset}
                limit={limit}
                setLimit={setLimit}
                page={page}
                setPage={setPage}
                isLookup={true}
                lookupFunc={getChoosed}
                dense={dense}
                setDense={setDense}
              />
            )
          ) : (
            smUp ? (
              <TableWrapperComplexResizer
                keyName={confName}
                lists={lists}
                listCount={listCount}
                setListCount={setListCount}
                setOffset={setOffset}
                limit={limit}
                setLimit={setLimit}
                page={page}
                setPage={setPage}
                isLookup={true}
                lookupFunc={getChoosed}
                dense={dense}
                setDense={setDense}
                tableName={tableName}
                columnResize={columnResize}
                setColumnWidth={setColumnWidth}
              />
            ) : (
              <TableWrapperComplex
                keyName={confName}
                keyID={confPrimKey}
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
                isLookup={true}
                lookupFunc={getChoosed}
                dense={dense}
                setDense={setDense}
              />
            )
          )
        }
      </>
    </ModalWrapper>
  );
});
