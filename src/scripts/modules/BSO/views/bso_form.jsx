import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SpacerContainer from '../../../components/SpacerContainer';
import AlertDialog from '../../../components/AlertDialog';
import GrandTotalWrapper from '../../../components/GrandTotalWrapper';
import useRedirectToParentLocation from '../../../hooks/useRedirectToParentLocation';
import usePopupLogin from '../../../hooks/usePopupLogin';
import useReducers from '../../../hooks/useReducers';
import useReducersItem from '../../../hooks/useReducersItem';
import useActions from '../../../hooks/useActions';
import useActionsItem from '../../../hooks/useActionsItem';
// import { dateToString, convertNewLine } from '../../../utils/formatter';
// import { typesError } from '../../../utils/types-error';
import { totalerafterdiscandtax, grandtotaler } from '../../../utils/calculate';

import bso_api from '../controllers/bso_api';
import { BSOFHEAD, BSOFITEM } from '../models/bso_field';
import { BSODHEAD, BSODITEM } from '../models/bso_data';
import { confName, confQtyKey } from '../models/bso_config';

import BSOFormHeader from './bso_form__header';
import BSOFormItem from './bso_form__item';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function BSOForm({ mode }) {
  const { state } = useLocation();
  const [headers, dispatchHeaders] = useReducer(useReducers, state || BSODHEAD);
  const [items, dispatchItems] = useReducer(useReducersItem, []);
  const [customerId, setCustomerId] = useState('');
  const [openHeader, setOpenHeader] = useState(mode === 'edit' ? false : state ? false : true);
  const [isSavedHeader, setIsSavedHeader] = useState(mode === 'edit' ? true : false);
  const [isEditHeader, setIsEditHeader] = useState(false);
  const [isEditItem, setIsEditItem] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const [total, setTotal] = useState(0);
  const [totalAfterDiscAndTax, setTotalAfterDiscAndTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const { id } = useParams();
  const { redirectToParentLocation } = useRedirectToParentLocation();
  const { isLoginPopup, loginFormPopup, handleOpenLoginPopup } = usePopupLogin();

  const headersDiscount = headers[BSOFHEAD.NPCTDISC];
  const headersTax = headers[BSOFHEAD.NPCTPPN];
  const headersAdjusment = 0;

  const totalCalculate = useCallback(() => {
    let totalVal = 0;
    items.forEach(
      (item) => (totalVal += item[BSOFITEM.NHRGJUA] * item[BSOFITEM.NQSO] - item[BSOFITEM.NRPDISC])
    );
    setTotal(totalVal);
  }, [items]);
  const totalAfterDiscAndTaxCalculate = useCallback(() => {
    const totalAfterDiscAndTaxVal = totalerafterdiscandtax(total, headersDiscount, headersTax);
    setTotalAfterDiscAndTax(totalAfterDiscAndTaxVal);
  }, [total, headersDiscount, headersTax]);
  const grandTotalCalculate = useCallback(() => {
    const grandTotalVal = grandtotaler(totalAfterDiscAndTax, headersAdjusment || 0);
    setGrandTotal(grandTotalVal);
  }, [totalAfterDiscAndTax, headersAdjusment]);

  useEffect(() => {
    isEditItem === false && totalCalculate();
  }, [isEditItem, totalCalculate]);
  useEffect(() => {
    isEditHeader === false && totalAfterDiscAndTaxCalculate();
  }, [isEditHeader, totalAfterDiscAndTaxCalculate]);
  useEffect(() => {
    isEditHeader === false && isEditItem === false && grandTotalCalculate();
  }, [isEditHeader, isEditItem, grandTotalCalculate]);

  useEffect(() => {
    let isActive = true;
    const putOrderDataToEditForm = async () => {
      try {
        const dataOptions = {
          key: id,
          listfields: [
            BSOFHEAD.DSODATE,
            BSOFHEAD.CSONUM,
            BSOFHEAD.DNEEDDATE,
            BSOFHEAD.CREMARK,
            BSOFHEAD.CUSTOMER._.CCUSID,
            BSOFHEAD.CCUSTPO,
            BSOFHEAD.CSHPTONAME,
            BSOFHEAD.CSHPTOADR1,
            BSOFHEAD.CSHPTOADR2,
            BSOFHEAD.CSHPTOKOTA,
            BSOFHEAD.CSHPTOUP,
            BSOFHEAD.NDUEDAYS,
            BSOFHEAD.NPCTDISC,
            BSOFHEAD.NPCTPPN,
            BSOFHEAD.CWHSEID,
            BSOFHEAD.CSALESID,
            BSOFHEAD.CSOFOOT1,
            BSOFHEAD.CSOFOOT2,
            BSOFHEAD.CSOFOOT3,
          ],
          listfields2: [
            BSOFITEM.NLINE,
            BSOFITEM.CSTOCODE,
            BSOFITEM.CSTONAME,
            BSOFITEM.CUOM,
            BSOFITEM.NHRGJUA,
            BSOFITEM.NQSO,
            BSOFITEM.NDISC,
            BSOFITEM.NRPDISC,
          ],
        };
        const fetchGetOrder = await bso_api.getRec(dataOptions);
        if (fetchGetOrder.result === true) {
          const { ccusid, dneeddate, bitmso, ...bhdso } = fetchGetOrder.data;
          dispatchHeaders({
            type: useActions.EDIT_STATE,
            payload: {
              customer: { ccusid, cinitial: '', cnotelp: '', cemail: '' },
              dneeddate: dneeddate.trim() || null,
              ...bhdso,
            },
          });
          dispatchItems({
            type: useActionsItem.EDIT_STATE,
            payload: bitmso,
          });
          setCustomerId(ccusid);
        } else if (fetchGetOrder.result === false) throw fetchGetOrder.onfail.cerror;
        else throw fetchGetOrder.message;
      } catch (error) {
        AlertDialog('error', `Gagal Mengambil Data ${confName}`, error, redirectToParentLocation);
      }
    };
    if (mode === 'edit' && isActive === true) {
      putOrderDataToEditForm();
    }
    return () => (isActive = false);
  }, [mode, id, dispatchHeaders, dispatchItems, redirectToParentLocation]);

  const handleSubmitOrder = async () => {
    setIsSubmit(true);
    setTimeout(() => {
      ConfirmDialog(
        'Keluar Form Sales Order',
        'Data Sales Order yang belum disimpan akan terhapus. Anda yakin?',
        'Keluar',
        redirectToParentLocation,
        () => {
          setIsSubmit(false);
        }
      );
    }, 500);
  };

  //#region handleSubmitOrder
  // const handleSubmitOrder = async () => {
  //   setIsSubmit(true);
  //   const captionSubmit = mode === 'add' ? 'Tambah' : 'Ubah';
  //   try {
  //     const dateFormatted = dateToString(headers[BSOFHEAD.DSODATE]);
  //     const needDateFormatted = dateToString(headers[BSOFHEAD.DNEEDDATE]);
  //     const lineItemsArray = items.map((item, index) => {
  //       return { ...item, [BSOFITEM.NLINE]: index + 1 };
  //     });
  //     const orderData = {
  //       soHeaderInfo: {
  //         ...headers,
  //         [BSOFHEAD.DSODATE]: dateFormatted,
  //         [BSOFHEAD.DNEEDDATE]: needDateFormatted === 'Invalid date' ? '' : needDateFormatted,
  //         [BSOFHEAD.NAMOUNT]: total,
  //       },
  //       lineItemsInfo: [...lineItemsArray],
  //     };

  //     // delete this later
  //     const showJSON = JSON.stringify(orderData, null, 2);
  //     console.log(showJSON);

  //     const fetchOrder =
  //       mode === 'add' ? await bso_api.add(orderData) : await bso_api.edit(id, orderData);
  //     if (fetchOrder.result === true) {
  //       const { ccusid, ccusnam, csonum } = fetchOrder.onsuccess;
  //       AlertDialog(
  //         'success',
  //         `Data ${confName} Berhasil di ${captionSubmit}`,
  //         <>
  //           <p>Customer ID: {ccusid}</p>
  //           <p>Customer Name: {ccusnam}</p>
  //           <p>Sales Order ID: {csonum}</p>
  //         </>,
  //         redirectToParentLocation
  //       );
  //     } else if (fetchOrder.result === false) {
  //       const errorMain = convertNewLine(fetchOrder.onfail.cerror);
  //       const errorMoreInfo = fetchOrder.moreinfo.Error;
  //       const errorAll =
  //         errorMain + (errorMoreInfo !== undefined ? convertNewLine(errorMoreInfo) : '');
  //       throw errorAll;
  //     } else {
  //       throw fetchOrder.message;
  //     }
  //   } catch (error) {
  //     switch (error) {
  //       case typesError.SECRET_INVALID.msg:
  //         AlertDialog(
  //           'error',
  //           'Session Telah Habis.',
  //           <p>
  //             Gagal {captionSubmit} Data {confName}
  //           </p>,
  //           handleOpenLoginPopup
  //         );
  //         break;
  //       case typesError.FETCH.msg:
  //         AlertDialog('error', 'Salah', typesError.FETCH.res);
  //         break;
  //       default:
  //         AlertDialog('error', 'Salah', error);
  //         break;
  //     }
  //   } finally {
  //     setIsSubmit(false);
  //   }
  // };
  //#endregion Submit

  return (
    <>
      {loginFormPopup()}
      <BSOFormHeader
        headers={headers}
        dispatchHeaders={dispatchHeaders}
        mode={mode}
        isLoginPopup={isLoginPopup}
        handleOpenLoginPopup={handleOpenLoginPopup}
        isSavedHeader={isSavedHeader}
        setIsSavedHeader={setIsSavedHeader}
        setIsEditHeader={setIsEditHeader}
        openHeader={openHeader}
        setOpenHeader={setOpenHeader}
        customerId={customerId}
      />
      <BSOFormItem
        salesOrderID={headers[BSOFHEAD.CSONUM]}
        warehouseID={headers[BSOFHEAD.CWHSEID]}
        items={items}
        dispatchItems={dispatchItems}
        initQtyItemKey={confQtyKey}
        initLineItemsInfo={BSODITEM}
        isLoginPopup={isLoginPopup}
        handleOpenLoginPopup={handleOpenLoginPopup}
        isEditItem={isEditItem}
        setIsEditItem={setIsEditItem}
        openHeader={openHeader}
        setOpenHeader={setOpenHeader}
        isSavedHeader={isSavedHeader}
        isSubmit={isSubmit}
      />
      <SpacerContainer />
      <GrandTotalWrapper
        total={total}
        discount={headers[BSOFHEAD.NPCTDISC]}
        tax={headers[BSOFHEAD.NPCTPPN]}
        totalAfterDiscAndTax={totalAfterDiscAndTax}
        grandTotal={grandTotal}
        submit={handleSubmitOrder}
        isSubmit={isSubmit}
        isEditDiscPPN={true}
        handleChangeDiscPPN={(event) =>
          dispatchHeaders({
            type: useActions.CHANGE_NUMBER,
            field: event.target.name,
            payload: event.target.value,
          })
        }
        disableDiscPPN={true}
        headers={headers}
        setIsEditHeader={setIsEditHeader}
      />
    </>
  );
}
