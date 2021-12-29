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
import TextFilterDialog from '../../../components/TextFilterDialog';
import useTableListsLookupDynamicResizer from '../../../hooks/useTableListsLookupDynamicResizer';
import useResponsive from '../../../hooks/useResponsive';

import bsalesp_api from '../controllers/bsalesp_api';
import { headCells, bodyCells } from '../models/bsalesp_table';
import { tableName, confName, confPrimKey, confSecKey } from '../models/bsalesp_config';
import { BSALESPSR } from '../models/bsalesp_sort';

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
  } = useTableListsLookupDynamicResizer({
    dataSource: bsalesp_api,
    headCells,
    confPrimKey,
    confSecKey,
    confName,
    sortDataBy: BSALESPSR,
    isLoginPopup,
    handleOpenLoginPopup,
    keySearchInit: '',
    textFilterInit: '',
    lookup,
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
          setOpenTextFilterDlg={setOpenTextFilterDlg}
        />
      }
    >
      <>
        <KeySearchDialog
          confName={confName}
          openKeySearchDlg={openKeySearchDlg}
          setOpenKeySearchDlg={setOpenKeySearchDlg}
          sortDataBy={BSALESPSR}
          indexKey={indexKey}
          setIndexKey={setIndexKey}
        />
        <TextFilterDialog
          confTextFilter={'Nama Sales Person'}
          openTextFilterDlg={openTextFilterDlg}
          setOpenTextFilterDlg={setOpenTextFilterDlg}
          handleTextFilter={handleTextFilter}
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
