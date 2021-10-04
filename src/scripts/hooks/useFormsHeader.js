import { useState } from 'react';
import { dateToString } from '../utils/formatter';

export default function useFormsHeader({ dispatchHeaders, useActions }) {
  const [openHeader, setOpenHeader] = useState(true);
  const handleChangeString = (event) => {
    dispatchHeaders({
      type: useActions.CHANGE_STRING,
      field: event.target.name,
      payload: event.target.value,
    });
  };
  const handleChangeStringChild = (event, fieldParent) => {
    dispatchHeaders({
      type: useActions.CHANGE_STRING_CHILD,
      fieldParent,
      fieldChild: event.target.name,
      payload: event.target.value,
    });
  };
  const handleChangeNumber = (event) => {
    dispatchHeaders({
      type: useActions.CHANGE_NUMBER,
      field: event.target.name,
      payload: event.target.value,
    });
  };
  const handleChangeCurrency = (values, name) => {
    dispatchHeaders({
      type: useActions.CHANGE_CURRENCY,
      field: name,
      payload: values.value,
    });
  };
  const handleChangeDate = (date, name) => {
    dispatchHeaders({
      type: useActions.CHANGE_STRING,
      field: name,
      payload: dateToString(date),
    });
  };
  const handleIncreaseNumber = (name, step, fixed = false) => {
    dispatchHeaders({
      type: useActions.INCREASE_NUMBER,
      field: name,
      payload: step,
      fixed: fixed,
    });
  };
  const handleDecreaseNumber = (name, step, fixed = false) => {
    dispatchHeaders({
      type: useActions.DECREASE_NUMBER,
      field: name,
      payload: step,
      fixed: fixed,
    });
  };

  return {
    openHeader,
    setOpenHeader,
    handleChangeString,
    handleChangeStringChild,
    handleChangeNumber,
    handleChangeCurrency,
    handleChangeDate,
    handleIncreaseNumber,
    handleDecreaseNumber,
  };
}
