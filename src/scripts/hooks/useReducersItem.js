import useActionsItem from './useActionsItem';
import { percentager, amounter } from '../utils/calculate';

const useReducersItem = (state, action) => {
  const updateDiscount = (data, index, initQtyItemKey) => {
    if (
      data[index]['nhrgjua'] === 0 ||
      data[index]['nhrgjua'] === '0.00' ||
      data[index]['nhrgjua'] === '' ||
      data[index]['nhrgjua'] === null ||
      data[index][initQtyItemKey] === 0 ||
      data[index][initQtyItemKey] === '0.00' ||
      data[index][initQtyItemKey] === '' ||
      data[index]['nhrgjua'] === null
    )
      return data;
    else {
      data[index]['ndisc'] = percentager(
        (data[index]['nhrgjua'] || 0) * (data[index][initQtyItemKey] || 0),
        data[index]['nrpdisc'],
      );
      return data;
    }
  };

  const updateAmount = (data, index, initQtyItemKey) => {
    data[index]['nrpdisc'] = amounter(
      (data[index]['nhrgjua'] || 0) * (data[index][initQtyItemKey] || 0),
      data[index]['ndisc'],
    );
    return data;
  };

  switch (action.type) {
    case useActionsItem.ADD_ITEM:
      return [...state, { ...action.payload, ...(state.length > 0 ? { nline: state[state.length - 1]['nline'] + 1 } : { nline: 1 }) }];
    case useActionsItem.REMOVE_ITEM: {
      const data = [...state];
      data.splice(action.index, 1);
      return data;
    }
    case useActionsItem.LOOKUP_ITEM_FROM_STOCK: {
      const data = [...state];
      data[action.index] = { ...data[action.index], ...action.payload };
      return data;
    }
    case useActionsItem.CHANGE_STRING: {
      const data = [...state];
      data[action.index][action.field] = action.payload;
      return data;
    }
    case useActionsItem.CHANGE_NUMBER: {
      const data = [...state];
      data[action.index][action.field] = action.payload;
      // update the disc amount if number changed
      const result = updateAmount(data, action.index, action.initQtyItemKey);
      return result;
    }
    case useActionsItem.INCREASE_NUMBER: {
      const data = [...state];
      data[action.index][action.field] = (
        parseFloat(data[action.index][action.field] || 0) + action.payload
      ).toFixed(2);
      // update the disc amount if number changed
      const result = updateAmount(data, action.index, action.initQtyItemKey);
      return result;
    }
    case useActionsItem.DECREASE_NUMBER: {
      const data = [...state];
      data[action.index][action.field] = (
        parseFloat(data[action.index][action.field] || 0) - action.payload
      ).toFixed(2);
      // update the disc amount if number changed
      const result = updateAmount(data, action.index, action.initQtyItemKey);
      return result;
    }
    case useActionsItem.CHANGE_CURRENCY: {
      const data = [...state];
      data[action.index][action.field] = action.payload;
      // update the disc amount if currency changed
      const result = updateAmount(data, action.index, action.initQtyItemKey);
      return result;
    }
    case useActionsItem.CHANGE_DISCOUNT_AMOUNT: {
      const data = [...state];
      data[action.index][action.field] = action.payload;
      // update the disc percent if disc amount changed
      const result = updateDiscount(data, action.index, action.initQtyItemKey);
      return result;
    }
    case useActionsItem.EDIT_STATE:
      return [...action.payload];
    default:
      return state;
  }
};

export default useReducersItem;
