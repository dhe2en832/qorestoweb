import React, { memo } from 'react';
import ProgressLoader from '../../../components/ProgressLoader';
import ModalWrapper from '../../../components/ModalWrapper';
import ToolbarSimple from '../../../components/ToolbarSimple';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import useTableListsLookup from '../../../hooks/useTableListsLookup';
import AlertContainer from '../../../components/AlertContainer';
import KeySearchDialog from '../../../components/KeySearchDialog';

import bwhse_api from '../controllers/bwhse_api';
import { headCells, bodyCells } from '../models/bwhse_table';
import { confName, confPrimKey, confSecKey } from '../models/bwhse_config';
import { BWHSESR } from '../models/bwhse_sort';

export default memo(function BSALESPLookup({
  lookup,
  abortLookup,
  getChoosed,
  isLoginPopup,
  handleOpenLoginPopup,
}) {
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
    lists,
    listCount,
    setListCount,
    setOffset,
    limit,
    setLimit,
    page,
    setPage,
  } = useTableListsLookup({
    dataSource: bwhse_api,
    headCells,
    confPrimKey,
    confSecKey,
    confName,
    sortDataBy: BWHSESR,
    isLoginPopup,
    handleOpenLoginPopup,
  });

  return (
    <ModalWrapper
      show={lookup.show}
      hide={abortLookup}
      title={`DAFTAR ${confName.toUpperCase()}`}
      caption={`Pilih salah satu ${confName} pada table untuk melanjutkan!`}
      toolbar={
        <ToolbarSimple
          showSwitch={false}
          showAdd={false}
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
          />
        )}
      </>
    </ModalWrapper>
  );
});
