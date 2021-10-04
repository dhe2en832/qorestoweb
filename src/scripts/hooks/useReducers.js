import useActions from './useActions';

const useReducers = (state, action) => {
  switch (action.type) {
    case useActions.CHANGE_STRING:
      return { ...state, [action.field]: action.payload };
    case useActions.CHANGE_STRING_CHILD:
      return {
        ...state,
        [action.fieldParent]: {
          ...state[action.fieldParent],
          [action.fieldChild]: action.payload,
        },
      };
    case useActions.CHANGE_NUMBER:
      return { ...state, [action.field]: action.payload || 0 };
    case useActions.INCREASE_NUMBER: {
      const finalState = parseInt(state[action.field] || 0) + action.payload;
      return {
        ...state,
        [action.field]:
          action.fixed === true ? finalState.toFixed(2) : finalState,
      };
    }
    case useActions.DECREASE_NUMBER: {
      const finalState = parseInt(state[action.field] || 0) - action.payload;
      return {
        ...state,
        [action.field]:
          action.fixed === true ? finalState.toFixed(2) : finalState,
      };
    }
    case useActions.CHANGE_CURRENCY:
      return {
        ...state,
        [action.field]: action.payload,
      };
    case useActions.EDIT_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default useReducers;
