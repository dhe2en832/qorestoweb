import { useState, useRef, useEffect } from 'react';
import useActionsItem from './useActionsItem';
import LookupStock from '../modules/BSTOCK/views/bstock_lookup';
import bstock_api from '../modules/BSTOCK/controller/bstock_api';
import { headCells } from '../modules/BSTOCK/model/bstock_table';

export default function useLookupsItemStock({
  items,
  dispatchItems,
  isLoginPopup,
  handleOpenLoginPopup,
}) {
  const itemsIDRef = useRef([]);

  const [lookupItemStock, setLookupItemStock] = useState({
    show: false,
    fromItemIndex: null,
    accessorName: '',
    nextInputName: '',
  });

  const [isFocusStock, setIsFocusStock] = useState({
    focus: false,
    targetIndex: null,
    targetName: '',
  });

  const handleUpdateItemStock = (stock, index) => {
    try {
      dispatchItems({
        type: useActionsItem.LOOKUP_ITEM_FROM_STOCK,
        index,
        payload: {
          cstocode: stock.cstocode,
          cstoname: stock.cstoname,
          cuom: stock.csatuan,
          nhrgjua: stock.nhrgjua,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenItemStock = (index, accessorName, nextInputName) => {
    setLookupItemStock({
      show: true,
      fromItemIndex: index,
      accessorName,
      nextInputName,
    });
  };

  const handleCloseItemStock = (isChoosed = false) => {
    try {
      if (isChoosed === true)
        setIsFocusStock({
          focus: true,
          targetIndex: lookupItemStock.fromItemIndex,
          targetName: lookupItemStock.nextInputName,
        });
      else {
        setIsFocusStock({
          focus: true,
          targetIndex: lookupItemStock.fromItemIndex,
          targetName: lookupItemStock.accessorName,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLookupItemStock({
        show: false,
        fromItemIndex: null,
        accessorName: '',
        nextInputName: '',
      });
    }
  };

  const handleCheckItemStock = async (value, index, name, nextFocus) => {
    if (lookupItemStock.show === false && isFocusStock.focus === false) {
      try {
        const listFieldsMap = headCells.map((head) => head.id);
        const dataOptions = {
          key: value,
          listfields: listFieldsMap,
        };
        const getStockById = await bstock_api.getRec(dataOptions);
        if (getStockById.result === true) {
          handleUpdateItemStock(getStockById.data, index);
        } else if (getStockById.result === false) {
          handleOpenItemStock(index, name, nextFocus);
        } else throw getStockById.message;
      } catch (error) {
        console.log(error);
      }
    } else {
      return false;
    }
  };

  const handleChooseItemStock = (event, stock) => {
    event.preventDefault();
    handleUpdateItemStock(stock, lookupItemStock.fromItemIndex);
    handleCloseItemStock(true);
  };

  const lookupItemStockElem = () => {
    return (
      lookupItemStock.show && (
        <LookupStock
          lookup={lookupItemStock}
          abortLookup={handleCloseItemStock}
          getChoosed={handleChooseItemStock}
          isLoginPopup={isLoginPopup}
          handleOpenLoginPopup={handleOpenLoginPopup}
        />
      )
    );
  };

  useEffect(() => {
    if (
      items.length &&
      isFocusStock.focus === true &&
      isFocusStock.targetIndex !== null &&
      isFocusStock.targetName !== ''
    ) {
      itemsIDRef.current[
        isFocusStock.targetName + '_' + isFocusStock.targetIndex.toString()
      ].focus();
      setIsFocusStock({
        focus: false,
        targetIndex: null,
        targetName: '',
      });
    }
  }, [isFocusStock, setIsFocusStock, items.length]);

  return {
    lookupItemStockElem,
    handleOpenItemStock,
    handleCheckItemStock,
    itemsIDRef,
    isFocusStock,
    setIsFocusStock,
  };
}
