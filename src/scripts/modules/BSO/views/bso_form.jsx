import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SpacerContainer from '../../../components/SpacerContainer';
import AlertDialog from '../../../components/AlertDialog';
import GrandTotalWrapper from '../../../components/GrandTotalWrapper';
import useRedirectToHome from '../../../hooks/useRedirectToHome';
import usePopupLogin from '../../../hooks/usePopupLogin';
import useReducers from '../../../hooks/useReducers';
import useReducersItem from '../../../hooks/useReducersItem';
import { dateToString } from '../../../utils/formatter';
import { typesError } from '../../../utils/types-error';
import { totalerafterdiscandtax, grandtotaler } from '../../../utils/calculate';

import bso_api from '../controller/bso_api';
import { BSOFHEAD, BSOFITEM } from '../model/bso_field';
import { BSODHEAD, BSODITEM } from '../model/bso_data';
import { confName, confQtyKey } from '../model/bso_config';

import BSOFormHeader from './bso_form__header';
import BSOFormItem from './bso_form__item';

export default function BSOForm({ mode }) {
  const [headers, dispatchHeaders] = useReducer(useReducers, BSODHEAD);
  const [items, dispatchItems] = useReducer(useReducersItem, []);
  const [isEditHeader, setIsEditHeader] = useState(false);
  const [isEditItem, setIsEditItem] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const [total, setTotal] = useState(0);
  const [totalAfterDiscAndTax, setTotalAfterDiscAndTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const { id } = useParams();
  const { redirectToHome } = useRedirectToHome();
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

  // useEffect(() => {
  //   const putOrderDataToEditForm = async () => {
  //     try {
  //       const fetchGetOrder = await bso_api.getById(id);
  //       if (fetchGetOrder.result === true) {
  //         dispatchHeaders({
  //           type: useActions.EDIT_STATE,
  //           payload: fetchGetOrder.onsuccess.data.soHeaderInfo,
  //         });
  //         dispatchItems({
  //           type: useActionsItem.EDIT_STATE,
  //           payload: fetchGetOrder.onsuccess.data.lineItemsInfo,
  //         });
  //       } else throw fetchGetOrder.onfail.cerror;
  //     } catch (error) {
  //       AlertDialog(
  //         'error',
  //         `Gagal Mengambil Data ${confName}`,
  //         error,
  //         redirectToParentLocation,
  //       );
  //     }
  //   };
  //   if (mode === 'edit') {
  //     putOrderDataToEditForm();
  //   }
  // }, [mode, id, dispatchHeaders, dispatchItems, redirectToParentLocation]);

  const handleSubmitOrder = async () => {
    setIsSubmit(true);
    const captionSubmit = mode === 'add' ? 'Tambah' : 'Ubah';
    try {
      const dateFormatted = dateToString(headers[BSOFHEAD.DSODATE]);
      const needDateFormatted = dateToString(headers[BSOFHEAD.DNEEDDATE]);
      const lineItemsArray = items.map((item, index) => {
        return { ...item, [BSOFITEM.NLINE]: index + 1 };
      });
      const orderData = {
        soHeaderInfo: {
          ...headers,
          [BSOFHEAD.DSODATE]: dateFormatted,
          [BSOFHEAD.DNEEDDATE]: needDateFormatted === 'Invalid date' ? '' : needDateFormatted,
          [BSOFHEAD.NAMOUNT]: total,
        },
        lineItemsInfo: [...lineItemsArray],
      };

      // delete this later
      const showJSON = JSON.stringify(orderData, null, 2);
      console.log(showJSON);

      const fetchPostOrder =
        mode === 'add' ? await bso_api.add(orderData) : await bso_api.edit(id, orderData);
      if (fetchPostOrder.result === true) {
        const { ccusid, ccusnam, csonum } = fetchPostOrder.onsuccess;
        AlertDialog(
          'success',
          `Data ${confName} Berhasil di ${captionSubmit}`,
          <>
            <p>Customer ID: {ccusid}</p>
            <p>Customer Name: {ccusnam}</p>
            <p>Sales Order ID: {csonum}</p>
          </>,
          redirectToHome
        );
      } else if (fetchPostOrder.result === false) {
        const regExNewLine = /(?:\r\n|\r|\n)/g;
        const errorMain = fetchPostOrder.onfail.cerror.replace(regExNewLine, '<br />');
        const errorMoreInfo = fetchPostOrder.moreinfo.Error.replace(regExNewLine, '<br />');
        const errorAll = errorMain + errorMoreInfo;
        throw errorAll;
      } else {
        throw fetchPostOrder.message;
      }
    } catch (error) {
      switch (error) {
        case typesError.SECRET_KEY.msg:
          AlertDialog(
            'error',
            'Session Telah Habis.',
            <p>
              Gagal {captionSubmit} Data {confName}
            </p>,
            handleOpenLoginPopup
          );
          break;
        case typesError.FETCH.msg:
          AlertDialog('error', 'Terjadi Kesalahan', typesError.FETCH.res);
          break;
        case typesError.ITEMS.msg:
          AlertDialog('error', 'Terjadi Kesalahan', typesError.ITEMS.res);
          break;
        default:
          AlertDialog('error', 'Terjadi Kesalahan', error);
          break;
      }
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <>
      {loginFormPopup()}
      <BSOFormHeader
        headers={headers}
        dispatchHeaders={dispatchHeaders}
        mode={mode}
        isLoginPopup={isLoginPopup}
        handleOpenLoginPopup={handleOpenLoginPopup}
        setIsEditHeader={setIsEditHeader}
      />
      <BSOFormItem
        items={items}
        dispatchItems={dispatchItems}
        initQtyItemKey={confQtyKey}
        initLineItemsInfo={BSODITEM}
        isLoginPopup={isLoginPopup}
        handleOpenLoginPopup={handleOpenLoginPopup}
        isEditItem={isEditItem}
        setIsEditItem={setIsEditItem}
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
      />
    </>
  );
}
