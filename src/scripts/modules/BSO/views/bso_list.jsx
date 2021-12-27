import React, { useState, useReducer } from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputTextComplex from '../../../components/InputTextComplex';
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
import { BSODHEAD } from '../models/bso_data';
import { tableName, confPrimKey, confName } from '../models/bso_config';
import { headCells, bodyCells } from '../models/bso_table';
import { BSOFHEAD } from '../models/bso_field';
import { BSOSR } from '../models/bso_sort';

import bcust_api from '../../BCUST/controllers/bcust_api';
import { BCUSTF } from '../../BCUST/models/bcust_field';
import BCUSTLookup from '../../BCUST/views/bcust_lookup';

import usePopupLogin from '../../../hooks/usePopupLogin';
import useActions from '../../../hooks/useActions';
import useReducers from '../../../hooks/useReducers';
import useLookup from '../../../hooks/useLookups';
import useFormsHeader from '../../../hooks/useFormsHeader';
import { Typography } from '@mui/material';

export default function BSOList() {
  const { smUp } = useResponsive();
  const [opCust, setOpCust] = useState(false);
  const [initHead, dispatchInitHead] = useReducer(useReducers, BSODHEAD);
  const { handleChangeStringChild } = useFormsHeader({
    dispatchHeaders: dispatchInitHead,
    useActions,
  });

  const { isLoginPopup, handleOpenLoginPopup } = usePopupLogin();
  const dataLookupNeeds = (name) => {
    switch (name) {
      case BCUSTF.CCUSID: {
        return [
          BCUSTF.CCUSID,
          BCUSTF.CCUSNAM,
          BCUSTF.CSHPCODE,
          BCUSTF.CSHPNAME,
          BCUSTF.CSHPTONAME,
          BCUSTF.CSHPTOADR1,
          BCUSTF.CSHPTOADR2,
          BCUSTF.CSHPTOKOTA,
          BCUSTF.CSHPTOUP,
          BCUSTF.NDUEDAYS,
          BCUSTF.NPCTDISC,
          BCUSTF.LPPN,
          BCUSTF.CDEFWHSEID,
          BCUSTF.CSALESID,
        ];
      }
      default:
        break;
    }
  };
  const payloadScheme = ({
    accessorName,
    changeLookupDetails,
    handleStateFromLookup,
    handleStateFromLookupChild,
    handleStateFromLookupMany,
    row,
  }) => {
    switch (accessorName) {
      case BSOFHEAD.CUSTOMER._.CCUSID: {
        handleStateFromLookupChild(accessorName, BSOFHEAD.CUSTOMER.AS, row[BCUSTF.CCUSID]);
        handleStateFromLookupMany({
          [BSOFHEAD.CSHPCODE]: row[BCUSTF.CSHPCODE],
          [BSOFHEAD.CSHPNAME]: row[BCUSTF.CSHPNAME],
          [BSOFHEAD.CSHPTONAME]: row[BCUSTF.CSHPTONAME],
          [BSOFHEAD.CSHPTOADR1]: row[BCUSTF.CSHPTOADR1],
          [BSOFHEAD.CSHPTOADR2]: row[BCUSTF.CSHPTOADR2],
          [BSOFHEAD.CSHPTOKOTA]: row[BCUSTF.CSHPTOKOTA],
          [BSOFHEAD.CSHPTOUP]: row[BCUSTF.CSHPTOUP],
          [BSOFHEAD.NDUEDAYS]: row[BCUSTF.NDUEDAYS],
          [BSOFHEAD.NPCTDISC]: row[BCUSTF.NPCTDISC],
          [BSOFHEAD.NPCTPPN]: row[BCUSTF.LPPN] === 'Y' ? 10.0 : 0.0,
          [BSOFHEAD.CWHSEID]: row[BCUSTF.CDEFWHSEID],
          [BSOFHEAD.CSALESID]: row[BCUSTF.CSALESID],
        });
        break;
      }
      default:
        break;
    }
  };
  const {
    handleOpenLookup,
    handleCloseLookup,
    handleCheckLookup,
    handleChooseLookup,
    showLookup,
    inputRef,
    isFocus,
    // setIsFocus,
  } = useLookup({
    dispatch: dispatchInitHead,
    isLoginPopup,
    useActions,
    dataLookupNeeds,
    payloadScheme,
  });

  const {
    url,
    loading,
    searchLabel,
    search,
    handleSearch,
    handleSubmitSearch,
    openKeySearchDlg,
    setOpenKeySearchDlg,
    handleKeySearch,
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
    optionsToShow: opCust,
  });

  const handleSubmitCust = () => {
    const passVal = initHead[BSOFHEAD.CUSTOMER.AS][BSOFHEAD.CUSTOMER._.CCUSID];
    handleSearch({
      target: { value: passVal },
    });
    handleKeySearch(passVal);
    setOpCust(true);
  };

  const handleBlurCust = (value, name, label, nextFocus, dataSrc) => {
    if (showLookup.show === false && isFocus.focus === false) {
      if (value === '') {
        // ToastBar(
        //   'error',
        //   `${label} tidak boleh kosong!`,
        //   3000,
        // () => setIsFocus({ focus: true, targetName: name }),
        //   'bottom-end'
        // );
      } else {
        handleCheckLookup(value, name, nextFocus, dataSrc);
      }
    }
  };

  function BSOShow() {
    return (
      <Container maxWidth="xl">
        {/* <Button
          ref={(el) => (inputRef.current['submitButton'] = el)}
          onClick={() => {
            setOpCust(false);
          }}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        >
          Pilih Customer
        </Button> */}
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
          url={url}
          setOpenKeySearchDlg={setOpenKeySearchDlg}
          setOpenTextFilterDlg={setOpenTextFilterDlg}
          searchLabel={searchLabel}
          search={search}
          handleSearch={handleSearch}
          handleSubmitSearch={handleSubmitSearch}
          isOrder={true}
          state={initHead}
        />
        {loading ? (
          <ProgressLoader />
        ) : useBRWDEF ? (
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
            handleDelete={() => {}}
            dense={dense}
            setDense={setDense}
          />
        )}
      </Container>
    );
  }

  function BSOAsk() {
    return (
      <Container>
        <Typography mb={2}>Isikan Kode Customer, jika ingin melewati beberapa tahap.</Typography>
        <Grid container justifyContent={'flex-start'} spacing={1}>
          <Grid item>
            <InputTextComplex
              ref={(el) => (inputRef.current[BSOFHEAD.CUSTOMER._.CCUSID] = el)}
              name={BSOFHEAD.CUSTOMER._.CCUSID}
              value={initHead[BSOFHEAD.CUSTOMER.AS][BSOFHEAD.CUSTOMER._.CCUSID]}
              nextFocus={'submitButton'}
              enterEvent={handleOpenLookup}
              change={(event) => handleChangeStringChild(event, BSOFHEAD.CUSTOMER.AS)}
              label={'Kode Customer'}
              blur={handleBlurCust}
              dataSrc={bcust_api}
            />
          </Grid>
          <Grid item>
            <Button
              ref={(el) => (inputRef.current['submitButton'] = el)}
              onClick={handleSubmitCust}
              variant="outlined"
              size="small"
            >
              OK
            </Button>
          </Grid>
        </Grid>
        <BCUSTLookup
          lookup={showLookup}
          abortLookup={handleCloseLookup}
          getChoosed={handleChooseLookup}
          isLoginPopup={isLoginPopup}
          handleOpenLoginPopup={handleOpenLoginPopup}
        />
      </Container>
    );
  }

  return (
    <>
      <Container></Container>
      {opCust ? BSOShow() : BSOAsk()}
    </>
  );
}
