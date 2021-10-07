import { useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AlertDialog from '../components/AlertDialog';
import AlertDialogNested from '../components/AlertDialogNested';
import { dateToString } from '../utils/formatter';
import { errorType } from '../utils/error';
import useReducers from './useReducers';
import useActions from './useActions';
import usePopupLogin from './usePopupLogin';
import useLookups from './useLookups';
import useRedirectToParentLocation from './useRedirectToParentLocation';

export default function useForms({
  dataSource,
  initState,
  initName,
  initFieldCode,
  initFieldValue,
  initLookupDetails,
  isLookup,
  lookupFunc,
  mode,
  payloadScheme,
}) {
  const [state, dispatch] = useReducer(useReducers, initState);
  const { id } = useParams();
  const idElem = initName.replace(/\/| /g, '');
  const { redirectToParentLocation } = useRedirectToParentLocation();
  const { isLoginPopup, loginFormPopup, handleOpenLoginPopup } =
    usePopupLogin();
  const {
    lookupDetails,
    showLookup,
    changeLookupDetails,
    handleCheckLookup,
    handleChooseLookup,
    handleOpenLookup,
    handleCloseLookup,
    handleStateFromLookup,
    handleStateFromLookupMany,
    inputRef,
  } = useLookups({
    initLookupDetails,
    dispatch,
    useActions,
    payloadScheme,
    isLoginPopup,
  });
  const handleChangeString = (event) => {
    dispatch({
      type: useActions.CHANGE_STRING,
      field: event.target.name,
      payload: event.target.value,
    });
  };
  const handleChangeStates = (payload) => {
    dispatch({
      type: useActions.EDIT_STATE,
      payload,
    });
  };
  const handleChangeNumber = (event) => {
    dispatch({
      type: useActions.CHANGE_NUMBER,
      field: event.target.name,
      payload: event.target.value,
    });
  };
  const handleChangeCurrency = (values, name) => {
    dispatch({
      type: useActions.CHANGE_CURRENCY,
      field: name,
      payload: values.value,
    });
  };
  const handleChangeDate = (date, name) => {
    dispatch({
      type: useActions.CHANGE_STRING,
      field: name,
      payload: dateToString(date),
    });
  };
  const handleIncreaseNumber = (name, step, fixed = false) => {
    dispatch({
      type: useActions.INCREASE_NUMBER,
      field: name,
      payload: step,
      fixed: fixed,
    });
  };
  const handleDecreaseNumber = (name, step, fixed = false) => {
    dispatch({
      type: useActions.DECREASE_NUMBER,
      field: name,
      payload: step,
      fixed: fixed,
    });
  };
  const handleSubmit = async (event) => {
    const captionSubmit = mode === 'add' ? 'Tambah' : 'Ubah';
    try {
      event.preventDefault();
      const fetchPost =
        mode === 'add'
          ? await dataSource.add(state)
          : await dataSource.edit(id, state);

      if (fetchPost.result === true) {
        const messageSuccess = [
          'success',
          `Data ${initName} Berhasil di ${captionSubmit}`,
          <>
            <b>
              {fetchPost.onsuccess[initFieldCode] || '-'} :{' '}
              {fetchPost.onsuccess[initFieldValue] || '-'}
            </b>
          </>,
        ];
        isLookup
          ? AlertDialogNested(idElem, ...messageSuccess, lookupFunc)
          : AlertDialog(...messageSuccess, redirectToParentLocation);
      } else throw fetchPost.onfail.cerror;
    } catch (error) {
      let messageError;
      error === errorType.tokenFailed
        ? (messageError = [
            'error',
            'Session Telah Habis.',
            <p>
              Gagal {captionSubmit} Data {initName}
            </p>,
            handleOpenLoginPopup,
          ])
        : (messageError = ['error', 'Salah', error]);
      isLookup
        ? AlertDialogNested(idElem, ...messageError)
        : AlertDialog(...messageError);
    }
  };

  useEffect(() => {
    const putDataToEditForm = async () => {
      try {
        const lists = await dataSource.getById(id);
        if (lists.result === true)
          dispatch({
            type: useActions.EDIT_STATE,
            payload: lists.onsuccess.data,
          });
        else throw lists.onfail.cerror;
      } catch (error) {
        AlertDialog(
          'error',
          'Gagal Mengambil Data',
          error,
          redirectToParentLocation,
        );
      }
    };
    if (mode === 'edit') putDataToEditForm();
  }, [mode, dataSource, id, redirectToParentLocation]);

  return {
    state,
    lookupDetails,
    showLookup,
    changeLookupDetails,
    handleCheckLookup,
    handleChooseLookup,
    handleOpenLookup,
    handleCloseLookup,
    handleStateFromLookup,
    handleStateFromLookupMany,
    handleChangeString,
    handleChangeStates,
    handleChangeNumber,
    handleChangeCurrency,
    handleChangeDate,
    handleIncreaseNumber,
    handleDecreaseNumber,
    handleSubmit,
    isLoginPopup,
    loginFormPopup,
    handleOpenLoginPopup,
    idElem,
    inputRef,
  };
}
