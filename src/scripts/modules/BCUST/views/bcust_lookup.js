import React, { memo } from 'react';
import ProgressLoader from '../../../components/ProgressLoader';
import ModalWrapper from '../../../components/ModalWrapper';
import ToolbarSimple from '../../../components/ToolbarSimple';
import TableWrapperComplex from '../../../components/TableWrapperComplex';
import useTableListsLookup from '../../../hooks/useTableListsLookup';
import AlertContainer from '../../../components/AlertContainer';

import bcust_api from '../controllers/bcust_api';
import { headCells, bodyCells } from '../models/bcust_table';
import { confName, confPrimKey, confSecKey } from '../models/bcust_config';
import { BCUSTSR } from '../models/bcust_sort';

export default memo(function BCUSTLookup({
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
    lists,
    listCount,
    setListCount,
    setOffset,
    limit,
    setLimit,
    page,
    setPage,
  } = useTableListsLookup({
    dataSource: bcust_api,
    headCells,
    confPrimKey,
    confSecKey,
    confName,
    sortDataBy: BCUSTSR,
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
        />
      }
    >
      <>
        <AlertContainer idElem={idElemLookup} />
        {loading ? (
          <ProgressLoader />
        ) : (
          <>
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
      </>
    </ModalWrapper>
  );
});
