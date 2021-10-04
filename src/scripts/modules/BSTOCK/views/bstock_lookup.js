import React, { memo } from 'react';
import ProgressLoader from '../../../components/ProgressLoader';
import ModalWrapper from '../../../components/ModalWrapper';
import ToolbarSimple from '../../../components/ToolbarSimple';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import useTableListsLookup from '../../../hooks/useTableListsLookup';
import useResponsive from '../../../hooks/useResponsive';
import AlertContainer from '../../../components/AlertContainer';

import bstock_api from '../controller/bstock_api';
import { headCells, bodyCells } from '../model/bstock_table';
import { confName, confPrimKey, confSecKey } from '../model/bstock_config';
import { BSTOCKSR } from '../model/bstock_sort';

export default memo(function BSTOCKLookup({
  lookup,
  abortLookup,
  getChoosed,
  isLoginPopup,
  handleOpenLoginPopup,
}) {
  const {
    idElem,
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
  } = useTableListsLookup({
    dataSource: bstock_api,
    headCells,
    confPrimKey,
    confSecKey,
    confName,
    sortDataBy: BSTOCKSR,
    isLoginPopup,
    handleOpenLoginPopup,
  });
  const { smUp } = useResponsive();

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
        />
      }
    >
      {loading ? (
        <ProgressLoader />
      ) : (
        <>
          <AlertContainer idElem={idElem} />
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
        </>
      )}
    </ModalWrapper>
  );
});
