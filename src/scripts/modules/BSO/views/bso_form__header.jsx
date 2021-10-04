import React, { memo } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FoldIcon from '@mui/icons-material/UnfoldLess';
import UnfoldIcon from '@mui/icons-material/UnfoldMore';
import InputText from '../../../components/InputText';
import InputTextComplex from '../../../components/InputTextComplex';
import InputDate from '../../../components/InputDate';
import InputCurrency from '../../../components/InputCurrency';
import InputDecimal from '../../../components/InputDecimal';
import InputWrapperLookup from '../../../components/InputWrapperLookup';
import ToastBar from '../../../components/ToastBar';
import useFormsHeader from '../../../hooks/useFormsHeader';
import useActions from '../../../hooks/useActions';
import useLookups from '../../../hooks/useLookups';
import useResponsive from '../../../hooks/useResponsive';

// import WarehouseSource from '../../../Master/Warehouse/data/warehouse-source';
// import CustomerSource from '../../../Master/Customer/data/customer-source';
// import ShipCodeSource from '../../../Master/ShipCode/data/shipCode-source';
// import SalesPersonSource from '../../../Master/SalesPerson/data/salesPerson-source';
// import LookupWarehouse from '../../../Master/Warehouse/views/LookupWarehouse';
// import LookupCustomer from '../../../Master/Customer/views/LookupCustomer';
// import LookupShipCode from '../../../Master/ShipCode/views/LookupShipCode';
// import LookupSalesPerson from '../../../Master/SalesPerson/views/LookupSalesPerson';
// import { FIELDS_WAREHOUSE } from '../../../Master/Warehouse/hooks/fieldsWarehouse';
// import { FIELDS_CUSTOMER } from '../../../Master/Customer/hooks/fieldsCustomer';
// import { FIELDS_SHIP_CODE } from '../../../Master/ShipCode/hooks/fieldsShipCode';
// import { FIELDS_SALES_PERSON } from '../../../Master/SalesPerson/hooks/fieldsSalesPerson';

import { BSOFHEAD } from '../model/bso_field';

export default memo(function BSOForm_Headers({
  headers,
  dispatchHeaders,
  mode,
  isLoginPopup,
  handleOpenLoginPopup,
  setIsEditHeader,
}) {
  const { smDown } = useResponsive();
  const {
    openHeader,
    setOpenHeader,
    handleChangeString,
    handleChangeStringChild,
    handleChangeNumber,
    handleChangeCurrency,
    handleChangeDate,
    handleIncreaseNumber,
    handleDecreaseNumber,
  } = useFormsHeader({
    dispatchHeaders,
    useActions,
  });

  // const payloadScheme = ({
  //   accessorName,
  //   changeLookupDetails,
  //   handleStateFromLookup,
  //   handleStateFromLookupChild,
  //   handleStateFromLookupMany,
  //   row,
  // }) => {
  //   switch (accessorName) {
  //     case BSOFHEAD.CUSTOMER._.CCUSID: {
  //       changeLookupDetails(accessorName, row[FIELDS_CUSTOMER.CCUSNAM]);
  //       handleStateFromLookupChild(
  //         accessorName,
  //         BSOFHEAD.CUSTOMER.AS,
  //         row[FIELDS_CUSTOMER.CCUSID]
  //       );
  //       handleStateFromLookupMany({
  //         [BSOFHEAD.CSHPCODE]: row[FIELDS_CUSTOMER.CSHPCODE],
  //         [BSOFHEAD.CSHPNAME]: row[FIELDS_CUSTOMER.CSHPNAME],
  //         [BSOFHEAD.CSHPTONAME]: row[FIELDS_CUSTOMER.CSHPTONAME],
  //         [BSOFHEAD.CSHPTOADR1]: row[FIELDS_CUSTOMER.CSHPTOADR1],
  //         [BSOFHEAD.CSHPTOADR2]: row[FIELDS_CUSTOMER.CSHPTOADR2],
  //         [BSOFHEAD.CSHPTOKOTA]: row[FIELDS_CUSTOMER.CSHPTOKOTA],
  //         [BSOFHEAD.CSHPTOUP]: row[FIELDS_CUSTOMER.CSHPTOUP],
  //       });
  //       break;
  //     }
  //     case BSOFHEAD.CWHSEID:
  //       handleStateFromLookup(accessorName, row[FIELDS_WAREHOUSE.CWHSEID]);
  //       break;
  //     case FIELDS_SHIP_CODE.CSHPCODE:
  //       handleStateFromLookupMany({
  //         [BSOFHEAD.CSHPCODE]: row[FIELDS_SHIP_CODE.CSHPCODE],
  //         [BSOFHEAD.CSHPNAME]: row[FIELDS_SHIP_CODE.CSHPNAME],
  //       });
  //       break;
  //     case BSOFHEAD.CSALESID:
  //       handleStateFromLookup(accessorName, row[FIELDS_SALES_PERSON.CSALESID]);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const {
    lookupDetails,
    showLookup,
    // handleCheckLookup,
    handleChooseLookup,
    // handleOpenLookup,
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
    // payloadScheme,
    isLoginPopup,
  });

  // const showLookupElements = () => {
  //   return (
  //     showLookup.show && (
  //       <>
  //         {showLookup.accessorName === BSOFHEAD.CUSTOMER._.CCUSID && (
  //           <LookupCustomer
  //             lookup={showLookup}
  //             abortLookup={handleCloseLookup}
  //             getChoosed={handleChooseLookup}
  //             isLoginPopup={isLoginPopup}
  //             handleOpenLoginPopup={handleOpenLoginPopup}
  //           />
  //         )}
  //         {showLookup.accessorName === BSOFHEAD.CWHSEID && (
  //           <LookupWarehouse
  //             lookup={showLookup}
  //             abortLookup={handleCloseLookup}
  //             getChoosed={handleChooseLookup}
  //             isLoginPopup={isLoginPopup}
  //             handleOpenLoginPopup={handleOpenLoginPopup}
  //           />
  //         )}
  //         {showLookup.accessorName === BSOFHEAD.CSHPCODE && (
  //           <LookupShipCode
  //             lookup={showLookup}
  //             abortLookup={handleCloseLookup}
  //             getChoosed={handleChooseLookup}
  //             isLoginPopup={isLoginPopup}
  //             handleOpenLoginPopup={handleOpenLoginPopup}
  //           />
  //         )}
  //         {showLookup.accessorName === BSOFHEAD.CSALESID && (
  //           <LookupSalesPerson
  //             lookup={showLookup}
  //             abortLookup={handleCloseLookup}
  //             getChoosed={handleChooseLookup}
  //             isLoginPopup={isLoginPopup}
  //             handleOpenLoginPopup={handleOpenLoginPopup}
  //           />
  //         )}
  //       </>
  //     )
  //   );
  // };

  const handleValidation = (value, name, label) => {
    if (isFocus.focus === false) {
      if (value === '') {
        ToastBar(
          'error',
          `${label} tidak boleh kosong!`,
          3000,
          () => setIsFocus({ focus: true, targetName: name }),
          smDown ? 'bottom-end' : 'top-end'
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
          smDown ? 'bottom-end' : 'top-end'
        );
      } else if (value === 'Invalid date') {
        ToastBar(
          'error',
          `${label} tidak valid!`,
          3000,
          () => setIsFocus({ focus: true, targetName: name }),
          smDown ? 'bottom-end' : 'top-end'
        );
      }
    }
  };

  const handleValidationWithLookup = (value, name, label, nextFocus, dataSrc) => {
    handleValidation(value, name, label);
  };

  return (
    <>
      {/* {showLookupElements()} */}
      <Container maxWidth="lg">
        <Grid container justifyContent="space-between">
          <Grid item container xs={10} justifyContent="flex-start">
            <Grid item container>
              <Typography variant="h6" component="h2">
                Sales Order
              </Typography>
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
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CSONUM] = el)}
                    label="No. SO"
                    name={BSOFHEAD.CSONUM}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSONUM]}
                    disabled={mode === 'edit' ? true : false}
                    blur={handleValidation}
                  />
                  <InputDate
                    ref={(el) => (inputRef.current[BSOFHEAD.DNEEDDATE] = el)}
                    label="Tgl. Perlu SO"
                    name={BSOFHEAD.DNEEDDATE}
                    value={headers[BSOFHEAD.DNEEDDATE]}
                    change={handleChangeDate}
                    // blur={handleValidationDate}
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CREMARK] = el)}
                    label="Keterangan"
                    name={BSOFHEAD.CREMARK}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CREMARK]}
                  />
                  <InputWrapperLookup lookup={lookupDetails[BSOFHEAD.CUSTOMER._.CCUSID]}>
                    <InputTextComplex
                      ref={(el) => (inputRef.current[BSOFHEAD.CUSTOMER._.CCUSID] = el)}
                      label="ID Customer"
                      name={BSOFHEAD.CUSTOMER._.CCUSID}
                      nextFocus={BSOFHEAD.CCUSTPO}
                      type="text"
                      change={(event) =>
                        handleChangeStringChild(event, BSOFHEAD.CUSTOMER.AS)
                      }
                      blur={handleValidationWithLookup}
                      value={
                        headers[BSOFHEAD.CUSTOMER.AS][BSOFHEAD.CUSTOMER._.CCUSID]
                      }
                      // dataSrc={CustomerSource}
                      // enterEvent={handleOpenLookup}
                    />
                  </InputWrapperLookup>
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CCUSTPO] = el)}
                    label="Nomor PO"
                    name={BSOFHEAD.CCUSTPO}
                    type="text"
                    change={handleChangeString}
                    blur={handleValidation}
                    value={headers[BSOFHEAD.CCUSTPO]}
                  />
                </Grid>
                <Grid item container spacing={1} xs={12} sm={6} md={3} lg={3}>
                  <InputTextComplex
                    ref={(el) => (inputRef.current[BSOFHEAD.CSHPCODE] = el)}
                    label="Kode Pengirim"
                    name={BSOFHEAD.CSHPCODE}
                    nextFocus={BSOFHEAD.CSHPTONAME}
                    type="text"
                    change={handleChangeString}
                    // blur={handleValidationWithLookup}
                    value={headers[BSOFHEAD.CSHPCODE]}
                    // dataSrc={ShipCodeSource}
                    // enterEvent={handleOpenLookup}
                  />
                  <InputText
                    label="Nama Pengirim"
                    name={BSOFHEAD.CSHPNAME}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPNAME]}
                    // disabled
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CSHPTONAME] = el)}
                    label="Nama Pada Pengiriman"
                    name={BSOFHEAD.CSHPTONAME}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTONAME]}
                  />
                  <InputText
                    label="Alamat Pengiriman"
                    name={BSOFHEAD.CSHPTOADR1}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOADR1]}
                  />
                  <InputText
                    label="Alamat Pengiriman..."
                    name={BSOFHEAD.CSHPTOADR2}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOADR2]}
                  />
                  <InputText
                    label="Kota Pengiriman"
                    name={BSOFHEAD.CSHPTOKOTA}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOKOTA]}
                  />
                  <InputText
                    label="U.P Pengiriman"
                    name={BSOFHEAD.CSHPTOUP}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSHPTOUP]}
                  />
                </Grid>
                <Grid item container spacing={1} xs={12} sm={6} md={3} lg={3}>
                  <InputText
                    label="Term. Pembayaran"
                    name={BSOFHEAD.CPAYTRM}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CPAYTRM]}
                  />
                  <InputCurrency
                    label="Uang Muka"
                    name={BSOFHEAD.NDP}
                    change={handleChangeCurrency}
                    value={headers[BSOFHEAD.NDP]}
                  />
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
                    // dataSrc={WarehouseSource}
                    // enterEvent={handleOpenLookup}
                  />
                  <InputTextComplex
                    ref={(el) => (inputRef.current[BSOFHEAD.CSALESID] = el)}
                    label="Sales Person"
                    name={BSOFHEAD.CSALESID}
                    nextFocus={BSOFHEAD.CSTATUS}
                    type="text"
                    change={handleChangeString}
                    blur={handleValidationWithLookup}
                    value={headers[BSOFHEAD.CSALESID]}
                    // dataSrc={SalesPersonSource}
                    // enterEvent={handleOpenLookup}
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CSOFOOT1] = el)}
                    label="Foot 1"
                    name={BSOFHEAD.CSOFOOT1}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSOFOOT1]}
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CSOFOOT2] = el)}
                    label="Foot 2"
                    name={BSOFHEAD.CSOFOOT2}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSOFOOT2]}
                  />
                  <InputText
                    ref={(el) => (inputRef.current[BSOFHEAD.CSOFOOT3] = el)}
                    label="Foot 3"
                    name={BSOFHEAD.CSOFOOT3}
                    type="text"
                    change={handleChangeString}
                    value={headers[BSOFHEAD.CSOFOOT3]}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
          <Grid item container xs={2} spacing={1}>
            <Grid item container justifyContent="flex-end">
              <Button
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => setOpenHeader(!openHeader)}
                aria-label="hide-show-headers-qo"
              >
                {openHeader ? <FoldIcon fontSize="small" /> : <UnfoldIcon fontSize="small" />}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
});
