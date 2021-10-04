import { useState } from 'react';
import useActionsItem from './useActionsItem';

export default function useFormsItem({
  dispatchItems,
  initLineItemsInfo,
  initQtyItemKey,
}) {
  const [isAddItem, setIsAddItem] = useState(false);

  const handleAddItem = () => {
    dispatchItems({
      type: useActionsItem.ADD_ITEM,
      payload: initLineItemsInfo,
    });
    setIsAddItem(true);
  };

  const handleRemoveItem = (index) => {
    dispatchItems({
      type: useActionsItem.REMOVE_ITEM,
      index: index,
    });
    setIsAddItem(false);
  };

  const handleChangeString = (event, index) => {
    dispatchItems({
      type: useActionsItem.CHANGE_STRING,
      field: event.target.name,
      payload: event.target.value,
      index: index,
    });
  };

  const handleChangeNumber = (event, index) => {
    dispatchItems({
      type: useActionsItem.CHANGE_NUMBER,
      field: event.target.name,
      payload: event.target.value,
      index: index,
      initQtyItemKey,
    });
  };

  const handleIncreaseNumber = (name, step, index) => {
    dispatchItems({
      type: useActionsItem.INCREASE_NUMBER,
      field: name,
      payload: step,
      index: index,
      initQtyItemKey,
    });
  };

  const handleDecreaseNumber = (name, step, index) => {
    dispatchItems({
      type: useActionsItem.DECREASE_NUMBER,
      field: name,
      payload: step,
      index: index,
      initQtyItemKey,
    });
  };

  const handleChangeCurrency = (values, name, index) => {
    dispatchItems({
      type: useActionsItem.CHANGE_CURRENCY,
      field: name,
      payload: values.value,
      index: index,
      initQtyItemKey,
    });
  };

  const handleChangeDiscAmount = (values, name, index) => {
    dispatchItems({
      type: useActionsItem.CHANGE_DISCOUNT_AMOUNT,
      field: name,
      payload: values.value,
      index: index,
      initQtyItemKey,
    });
  };

  return {
    handleAddItem,
    handleRemoveItem,
    handleChangeString,
    handleChangeNumber,
    handleIncreaseNumber,
    handleDecreaseNumber,
    handleChangeCurrency,
    handleChangeDiscAmount,
    isAddItem,
  };
}
