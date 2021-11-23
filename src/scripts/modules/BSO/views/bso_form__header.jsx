import React, { useState, useEffect, memo } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import FoldIcon from '@mui/icons-material/UnfoldLess';
import UnfoldIcon from '@mui/icons-material/UnfoldMore';
import SaveIcon from '@mui/icons-material/Save';
import InputText from '../../../components/InputText';
import InputTextComplex from '../../../components/InputTextComplex';
import InputDate from '../../../components/InputDate';
// import InputCurrency from '../../../components/InputCurrency';
import InputDecimal from '../../../components/InputDecimal';
import InputWrapperLookup from '../../../components/InputWrapperLookup';
import ToastBar from '../../../components/ToastBar';
import AlertDialog from '../../../components/AlertDialog';
import useFormsHeader from '../../../hooks/useFormsHeader';
import useActions from '../../../hooks/useActions';
import useLookups from '../../../hooks/useLookups';
import useResponsive from '../../../hooks/useResponsive';
import { stringToDate } from '../../../utils/formatter';
import { typesError } from '../../../utils/types-error';
import { convertNewLine } from '../../../utils/formatter';

// BSO
import bso_api from '../controller/bso_api';

// BCUST
import BCUSTLookup from '../../BCUST/views/bcust_lookup';
import bcust_api from '../../BCUST/controllers/bcust_api';
import { BCUSTF } from '../../BCUST/models/bcust_field';

// BWHSE
import BWHSELookup from '../../BWHSE/views/bwhse_lookup';
import bwhse_api from '../../BWHSE/controllers/bwhse_api';
import { BWHSEF } from '../../BWHSE/models/bwhse_field';

// BSALESP
import BSALESPLookup from '../../BSALESP/views/bsalesp_lookup';
import bsalesp_api from '../../BSALESP/controllers/bsalesp_api';
import { BSALESPF } from '../../BSALESP/models/bsalesp_field';

import { BSOFHEAD } from '../model/bso_field';

export default memo(function BSOForm_Headers({
  headers,
  dispatchHeaders,
  mode,
  isLoginPopup,
  handleOpenLoginPopup,
  isSavedHeader,
  setIsEditHeader,
  setIsSavedHeader,
  openHeader,
  setOpenHeader,
  customerId,
}) {
  const { smUp } = useResponsive();
  const [openFoot, setOpenFoot] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const disableCheck = mode === 'edit' ? true : isSavedHeader ? true : false;

  const {
    handleChangeString,
    handleChangeStringChild,
    handleChangeNumber,
    // handleChangeCurrency,
    handleChangeDate,
    handleIncreaseNumber,
    handleDecreaseNumber,
  } = useFormsHeader({
    dispatchHeaders,
    useActions,
  });

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
        changeLookupDetails(accessorName, row[BCUSTF.CCUSNAM]);
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
      case BSOFHEAD.CSALESID:
        handleStateFromLookup(accessorName, row[BSALESPF.CSALESID]);
        break;
      case BSOFHEAD.CWHSEID:
        handleStateFromLookup(accessorName, row[BWHSEF.CWHSEID]);
        break;
      // case FIELDS_SHIP_CODE.CSHPCODE:
      //   handleStateFromLookupMany({
      //     [BSOFHEAD.CSHPCODE]: row[FIELDS_SHIP_CODE.CSHPCODE],
      //     [BSOFHEAD.CSHPNAME]: row[FIELDS_SHIP_CODE.CSHPNAME],
      //   });
      //   break;
      default:
        break;
    }
  };

  const dataLookupNeeds = (name) => {
    switch (name) {
      case BSOFHEAD.CUSTOMER._.CCUSID: {
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
      case BSOFHEAD.CWHSEID: {
        return [BWHSEF.CWHSEID];
      }
      case BSOFHEAD.CSALESID: {
        return [BSALESPF.CSALESID];
      }
      default:
        break;
    }
  };

  const {
    lookupDetails,
    changeLookupDetails,
    showLookup,
    handleCheckLookup,
    handleChooseLookup,
    handleOpenLookup,
    handleCloseLookup,
    inputRef,
    isFocus,
    setIsFocus,
  } = useLookups({
    initLookupDetails: {
      [BSOFHEAD.CUSTOMER._.CCUSID]: '',
    },
    dispatch: dispatchHeaders,
    useActions,
    payloadScheme,
    dataLookupNeeds,
    isLoginPopup,
  });

  const showLookupElements = () => {
    return (
      showLookup.show && (
        <>
          {showLookup.accessorName === BSOFHEAD.CUSTOMER._.CCUSID && (
            <BCUSTLookup
              lookup={showLookup}
              abortLookup={handleCloseLookup}
              getChoosed={handleChooseLookup}
              isLoginPopup={isLoginPopup}
              handleOpenLoginPopup={handleOpenLoginPopup}
            />
          )}
          {showLookup.accessorName === BSOFHEAD.CWHSEID && (
            <BWHSELookup
              lookup={showLookup}
              abortLookup={handleCloseLookup}
              getChoosed={handleChooseLookup}
              isLoginPopup={isLoginPopup}
              handleOpenLoginPopup={handleOpenLoginPopup}
            />
          )}
          {showLookup.accessorName === BSOFHEAD.CSALESID && (
            <BSALESPLookup
              lookup={showLookup}
              abortLookup={handleCloseLookup}
              getChoosed={handleChooseLookup}
              isLoginPopup={isLoginPopup}
              handleOpenLoginPopup={handleOpenLoginPopup}
            />
          )}
        </>
      )
    );
  };

  const handleValidation = (value, name, label) => {
    if (isFocus.focus === false) {
      if (value === '') {
        ToastBar(
          'error',
          `${label} tidak boleh kosong!`,
          3000,
          () => setIsFocus({ focus: true, targetName: name }),
          'bottom-end'
        );
      }
    }
  };

  const handleValidationDate = (value, name, label) => {
    if (isFocus.focus === false) {
      if (value === '' || value === null) {
        ToastBar(
          'error',
          `${label} tidak boleh kosong!`,
          3000,
          () => setIsFocus({ focus: true, targetName: name }),
          'bottom-end'
        );
      } else if (value === 'Invalid date') {
        ToastBar(
          'error',
          `${label} tidak valid!`,
          3000,
          () => setIsFocus({ focus: true, targetName: name }),
          'bottom-end'
        );
      }
    }
  };

  const handleValidationWithLookup = (value, name, label, nextFocus, dataSrc) => {
    if (isFocus.focus === false && showLookup.show === false) {
      if (value === '') {
        ToastBar(
          'error',
          `${label} tidak boleh kosong!`,
          3000,
          () => {
            setIsFocus({ focus: true, targetName: name });
          },
          'bottom-end'
        );
        handleOpenLookup(name, nextFocus, dataSrc);
      } else {
        handleCheckLookup(value, name, nextFocus, dataSrc);
      }
    }
  };

  const saveOrderHeader = async () => {
    let moreInfo;
    if (mode === 'add' && openHeader === true && isSavedHeader === false) {
      setLoadingBtn(true);
      try {
        const dataOptions = {
          data: { ...headers },
        };
        const fetchHeader = await bso_api.addrec(dataOptions);
        moreInfo = fetchHeader.moreinfo;
        if (fetchHeader.result === true) {
          const { csonum } = fetchHeader.onsuccess;
          ToastBar(
            'success',
            `Header SO#${csonum} Berhasil Disimpan!`,
            3000,
            () => {
              setIsSavedHeader(true);
              dispatchHeaders({
                type: useActions.CHANGE_STRING,
                field: BSOFHEAD.CSONUM,
                payload: csonum,
              });
            },
            'bottom-end'
          );
        } else if (fetchHeader.result === false) throw fetchHeader.onfail.cerror;
        else throw fetchHeader.message;
      } catch (error) {
        switch (error) {
          case typesError.SECRET_INVALID.msg:
            AlertDialog(
              'error',
              'Session Telah Habis.',
              <p>Gagal Simpan Data Header</p>,
              handleOpenLoginPopup
            );
            break;
          case typesError.FETCH.msg:
            AlertDialog('error', 'Salah', typesError.FETCH.res);
            break;
          default:
            AlertDialog(
              'error',
              error,
              moreInfo.Error ? convertNewLine(moreInfo.Error) : '',
              () => {
                setOpenHeader(true);
                setIsFocus({
                  focus: true,
                  targetName: BSOFHEAD.DSODATE,
                });
              }
            );
            break;
        }
      } finally {
        setLoadingBtn(false);
      }
    }
  };

  useEffect(() => {
    let isActive = true;
    async function getCustName() {
      try {
        const fetchCustName = await bcust_api.getRec({
          key: customerId,
          listfields: [BCUSTF.CCUSNAM],
        });
        if (fetchCustName.result === true) {
          changeLookupDetails(BSOFHEAD.CUSTOMER._.CCUSID, fetchCustName.data[BCUSTF.CCUSNAM]);
        } else if (fetchCustName.result === false) throw fetchCustName.onfail.cerror;
        else throw fetchCustName.message;
      } catch (error) {
        console.log(error);
        // ToastBar(
        //   'error',
        //   'Gagal Lookup Nama Customer (ccusid field)',
        //   3000,
        //   () => {},
        //   'bottom-end'
        // );
      }
    }
    if (mode === 'edit' && customerId !== '' && lookupDetails.ccusid === '' && isActive === true)
      getCustName();
    return () => (isActive = false);
  }, [mode, customerId, lookupDetails, changeLookupDetails]);

  return (
    <>
      {showLookupElements()}
      <Container maxWidth="lg">
        <Grid container justifyContent="space-between">
          <Grid item container xs={10} justifyContent="flex-start">
            <Grid item container spacing={1} justifyContent={'stretch'}>
              <Grid item>
                <Typography variant="h6" component="h2">
                  Sales Order
                </Typography>
              </Grid>
              {!openHeader && (
                <Grid item container spacing={smUp ? 1 : 0} flexDirection={smUp ? 'row' : 'column'}>
                  <Grid item>
                    <Typography variant="body2" component="h3">
                      Tgl. SO: <b>{stringToDate(headers[BSOFHEAD.DSODATE]) || '-'}</b>
                    </Typography>
                    {isSavedHeader && (
                      <Typography variant="body2" component="h3">
                        No. SO: <b>{headers[BSOFHEAD.CSONUM]}</b>
                      </Typography>
                    )}
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" component="h3">
                      Customer:{' '}
                      <b>
                        {headers[BSOFHEAD.CUSTOMER.AS][BSOFHEAD.CUSTOMER._.CCUSID] || '-'}
                        <br />
                        {lookupDetails[BSOFHEAD.CUSTOMER._.CCUSID]}
                      </b>
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" component="h3">
                      Kirim Ke:{' '}
                      <b>
                        {headers[BSOFHEAD.CSHPTONAME]}
                        <br />
                        {headers[BSOFHEAD.CSHPTOADR1]}
                        <br />
                        {headers[BSOFHEAD.CSHPTOADR2]}
                      </b>
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" component="h3">
                      Gudang Asal: <b>{headers[BSOFHEAD.CWHSEID] || '-'}</b>
                    </Typography>
                    <Typography variant="body2" component="h3">
                      Sales Person: <b>{headers[BSOFHEAD.CSALESID] || '-'}</b>
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Collapse in={openHeader}>
              <Grid item container alignItems="flex-start" spacing={1}>
                <Grid item container spacing={1} xs={12} sm={6} md={3} lg={3}>
                  <InputDate
                    ref={(el) => (inputRef.current[BSOFHEAD.DSODATE] = el)}
                    label="Tgl. SO"
                    name={BSOFHEAD.DSODATE}
                    value={headers[BSOFHEAD.DSODATE]}
                    change={handleChangeDate}
                    blur={handleValidationDate}
                    autoFocus={true}
                    disabled={disableCheck}
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CSONUM] = el)}
                    label="No. SO"
                    name={BSOFHEAD.CSONUM}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSONUM]}
                    disabled={disableCheck}
                    blur={handleValidation}
                  />
                  <InputDate
                    ref={(el) => (inputRef.current[BSOFHEAD.DNEEDDATE] = el)}
                    label="Tgl. Perlu SO"
                    name={BSOFHEAD.DNEEDDATE}
                    value={headers[BSOFHEAD.DNEEDDATE]}
                    change={handleChangeDate}
                    // blur={handleValidationDate}
                    disabled={disableCheck}
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CREMARK] = el)}
                    label="Keterangan"
                    name={BSOFHEAD.CREMARK}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CREMARK]}
                    disabled={disableCheck}
                  />
                  <InputWrapperLookup
                    lookup={lookupDetails[BSOFHEAD.CUSTOMER._.CCUSID]}
                    disabled={disableCheck}
                  >
                    <InputTextComplex
                      ref={(el) => (inputRef.current[BSOFHEAD.CUSTOMER._.CCUSID] = el)}
                      label="ID Customer"
                      name={BSOFHEAD.CUSTOMER._.CCUSID}
                      nextFocus={BSOFHEAD.CCUSTPO}
                      type="text"
                      change={(event) => handleChangeStringChild(event, BSOFHEAD.CUSTOMER.AS)}
                      blur={handleValidationWithLookup}
                      value={headers[BSOFHEAD.CUSTOMER.AS][BSOFHEAD.CUSTOMER._.CCUSID]}
                      dataSrc={bcust_api}
                      enterEvent={handleOpenLookup}
                      disabled={disableCheck}
                    />
                  </InputWrapperLookup>
                </Grid>
                <Grid item container spacing={1} xs={12} sm={6} md={3} lg={3}>
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CCUSTPO] = el)}
                    label="Nomor PO"
                    name={BSOFHEAD.CCUSTPO}
                    type="text"
                    change={handleChangeString}
                    blur={handleValidation}
                    value={headers[BSOFHEAD.CCUSTPO]}
                    disabled={disableCheck}
                  />
                  {/* <InputTextComplex
                    ref={(el) => (inputRef.current[BSOFHEAD.CSHPCODE] = el)}
                    label="Kode Pengirim"
                    name={BSOFHEAD.CSHPCODE}
                    nextFocus={BSOFHEAD.CSHPTONAME}
                    type="text"
                    change={handleChangeString}
                    blur={handleValidationWithLookup}
                    value={headers[BSOFHEAD.CSHPCODE]}
                    dataSrc={ShipCodeSource}
                    enterEvent={handleOpenLookup}
                    disabled={disableCheck}
                  />
                  <InputText
                    label="Nama Pengirim"
                    name={BSOFHEAD.CSHPNAME}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPNAME]}
                    disabled={disableCheck}
                  /> */}
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CSHPTONAME] = el)}
                    label="Nama Pada Pengiriman"
                    name={BSOFHEAD.CSHPTONAME}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTONAME]}
                    disabled={disableCheck}
                  />
                  <InputText
                    label="Alamat Pengiriman"
                    name={BSOFHEAD.CSHPTOADR1}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOADR1]}
                    disabled={disableCheck}
                  />
                  <InputText
                    label="Alamat Pengiriman..."
                    name={BSOFHEAD.CSHPTOADR2}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOADR2]}
                    disabled={disableCheck}
                  />
                  <InputText
                    label="Kota Pengiriman"
                    name={BSOFHEAD.CSHPTOKOTA}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOKOTA]}
                    disabled={disableCheck}
                  />
                </Grid>
                <Grid item container spacing={1} xs={12} sm={6} md={3} lg={3}>
                  <InputText
                    label="U.P Pengiriman"
                    name={BSOFHEAD.CSHPTOUP}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOUP]}
                    disabled={disableCheck}
                  />
                  {/* <InputText
                    label="Term. Pembayaran"
                    name={BSOFHEAD.CPAYTRM}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CPAYTRM]}
                    disabled={disableCheck}
                  />
                  <InputCurrency
                    label="Uang Muka"
                    name={BSOFHEAD.NDP}
                    change={handleChangeCurrency}
                    value={headers[BSOFHEAD.NDP]}
                    disabled={disableCheck}
                  /> */}
                  <InputDecimal
                    label="Jatuh Tempo"
                    name={BSOFHEAD.NDUEDAYS}
                    decimalScale={0}
                    fixedDecimalScale={false}
                    increase={handleIncreaseNumber}
                    decrease={handleDecreaseNumber}
                    change={handleChangeNumber}
                    value={headers[BSOFHEAD.NDUEDAYS]}
                    placeholder="%"
                    disabled={disableCheck}
                  />
                  <InputDecimal
                    label="Discount"
                    name={BSOFHEAD.NPCTDISC}
                    increase={handleIncreaseNumber}
                    decrease={handleDecreaseNumber}
                    change={handleChangeNumber}
                    value={headers[BSOFHEAD.NPCTDISC]}
                    placeholder="%"
                    setIsEditHeader={setIsEditHeader}
                    disabled={disableCheck}
                  />
                  <InputDecimal
                    label="PPN"
                    name={BSOFHEAD.NPCTPPN}
                    increase={handleIncreaseNumber}
                    decrease={handleDecreaseNumber}
                    change={handleChangeNumber}
                    value={headers[BSOFHEAD.NPCTPPN]}
                    placeholder="%"
                    setIsEditHeader={setIsEditHeader}
                    disabled={disableCheck}
                  />
                </Grid>
                <Grid item container spacing={1} xs={12} sm={6} md={3} lg={3}>
                  <InputTextComplex
                    ref={(el) => (inputRef.current[BSOFHEAD.CWHSEID] = el)}
                    label="Gudang"
                    name={BSOFHEAD.CWHSEID}
                    nextFocus={BSOFHEAD.CSALESID}
                    type="text"
                    change={handleChangeString}
                    blur={handleValidationWithLookup}
                    value={headers[BSOFHEAD.CWHSEID]}
                    dataSrc={bwhse_api}
                    enterEvent={handleOpenLookup}
                    disabled={disableCheck}
                  />
                  <InputTextComplex
                    ref={(el) => (inputRef.current[BSOFHEAD.CSALESID] = el)}
                    label="Sales Person"
                    name={BSOFHEAD.CSALESID}
                    nextFocus={'CFOOT_BUTTON'}
                    type="text"
                    change={handleChangeString}
                    blur={handleValidationWithLookup}
                    value={headers[BSOFHEAD.CSALESID]}
                    dataSrc={bsalesp_api}
                    enterEvent={handleOpenLookup}
                    disabled={disableCheck}
                  />
                  <Grid item container xs={12}>
                    <Button
                      ref={(el) => (inputRef.current['CFOOT_BUTTON'] = el)}
                      onClick={() => setOpenFoot(!openFoot)}
                      variant="outlined"
                    >
                      Ket. Sales Order
                    </Button>
                    <Collapse in={openFoot}>
                      <Grid item container spacing={1} mt={0.1}>
                        <InputText
                          ref={(el) => (inputRef.current[BSOFHEAD.CSOFOOT1] = el)}
                          label="Ket. 1"
                          name={BSOFHEAD.CSOFOOT1}
                          type="text"
                          change={handleChangeString}
                          value={headers[BSOFHEAD.CSOFOOT1]}
                          disabled={disableCheck}
                        />
                        <InputText
                          ref={(el) => (inputRef.current[BSOFHEAD.CSOFOOT2] = el)}
                          label="Ket. 2"
                          name={BSOFHEAD.CSOFOOT2}
                          type="text"
                          change={handleChangeString}
                          value={headers[BSOFHEAD.CSOFOOT2]}
                          disabled={disableCheck}
                        />
                        <InputText
                          ref={(el) => (inputRef.current[BSOFHEAD.CSOFOOT3] = el)}
                          label="Ket. 3"
                          name={BSOFHEAD.CSOFOOT3}
                          type="text"
                          change={handleChangeString}
                          value={headers[BSOFHEAD.CSOFOOT3]}
                          disabled={disableCheck}
                        />
                      </Grid>
                    </Collapse>
                    {isSavedHeader && (
                      <Grid container alignContent="center" mt={1}>
                        <Typography color="green" fontWeight="100">
                          Status: Tersimpan
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
          <Grid item container xs={2} spacing={1}>
            <Grid item container justifyContent="flex-end">
              <LoadingButton
                variant="contained"
                size="small"
                color="secondary"
                loading={loadingBtn}
                onClick={() => {
                  setOpenHeader(!openHeader);
                  saveOrderHeader();
                }}
                aria-label="hide-show-headers-qo"
              >
                {isSavedHeader ? (
                  openHeader ? (
                    <FoldIcon fontSize="small" />
                  ) : (
                    <UnfoldIcon fontSize="small" />
                  )
                ) : (
                  <SaveIcon fontSize="small" />
                )}
              </LoadingButton>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
});
