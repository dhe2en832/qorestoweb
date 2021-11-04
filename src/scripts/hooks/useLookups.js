import { useState, useRef, useEffect } from 'react';
import ToastBar from '../components/ToastBar';
import { typesError } from '../utils/types-error';

export default function useLookup({
  initLookupDetails,
  dispatch,
  useActions,
  payloadScheme,
  dataLookupNeeds,
  isLoginPopup,
}) {
  const [lookupDetails, setLookupDetails] = useState(initLookupDetails || {});
  const [showLookup, setShowLookup] = useState({
    show: false,
    accessorName: '',
    nextInputName: '',
    dataSource: null,
  });
  const [isFocus, setIsFocus] = useState({
    focus: false,
    targetName: '',
  });
  const inputRef = useRef({});
  const changeLookupDetails = (name, value) => {
    setLookupDetails({
      ...lookupDetails,
      [name]: value,
    });
  };
  const handleOpenLookup = (accessorName, nextInputName, dataSource) => {
    setShowLookup({
      show: true,
      accessorName,
      nextInputName,
      dataSource,
    });
  };
  const handleCloseLookup = (isChoosed = false) => {
    try {
      if (isChoosed === true) {
        setIsFocus({
          focus: true,
          targetName: showLookup.nextInputName,
        });
      } else {
        setIsFocus({
          focus: true,
          targetName: showLookup.accessorName,
        });
      }
    } catch (error) {
      ToastBar('error', error, 3000, () => { }, 'bottom-end');
    } finally {
      setShowLookup({
        show: false,
        accessorName: '',
        nextInputName: '',
        dataSource: null,
      });
    }
  };
  const handleStateFromLookup = (accessorName, payload) => {
    dispatch({
      type: useActions.CHANGE_STRING,
      field: accessorName,
      payload,
    });
  };
  const handleStateFromLookupChild = (fieldChild, fieldParent, payload) => {
    dispatch({
      type: useActions.CHANGE_STRING_CHILD,
      fieldParent,
      fieldChild,
      payload,
    });
  };
  const handleStateFromLookupMany = (payload) => {
    dispatch({
      type: useActions.EDIT_STATE,
      payload,
    });
  };
  const handleCheckLookup = async (id, accessorName, nextInputName, dataSource) => {
    if (showLookup.show === false && isLoginPopup === false && isFocus.focus === false) {
      try {
        const dataOptions = {
          key: id,
          listfields: dataLookupNeeds(accessorName),
        };
        const getSourceByID = await dataSource.getRec(dataOptions);
        if (getSourceByID.result === true) {
          payloadScheme({
            accessorName,
            changeLookupDetails,
            handleStateFromLookup,
            handleStateFromLookupChild,
            handleStateFromLookupMany,
            row: getSourceByID.data,
          });
        } else if (getSourceByID.result === false)
          ToastBar(
            'error',
            getSourceByID.onfail.cerror,
            3000,
            () => {
              handleOpenLookup(accessorName, nextInputName, dataSource);
            },
            'bottom-end'
          );
        else throw getSourceByID.message;
      } catch (error) {
        ToastBar(
          'error',
          error === typesError.FETCH.msg ? typesError.FETCH.res : error,
          3000,
          () => {
            setIsFocus({ focus: true, targetName: accessorName });
          },
          'bottom-end'
        );
      }
    } else {
      return false;
    }
  };
  const handleChooseLookup = async (event, row) => {
    event.preventDefault();
    try {
      const dataOptions = {
        key: row.key,
        listfields: dataLookupNeeds(showLookup.accessorName),
      };
      const getSourceByID = await showLookup.dataSource.getRec(dataOptions);
      if (getSourceByID.result === true) {
        handleCloseLookup(true);
        payloadScheme({
          accessorName: showLookup.accessorName,
          changeLookupDetails,
          handleStateFromLookup,
          handleStateFromLookupChild,
          handleStateFromLookupMany,
          row: getSourceByID.data,
        });
      } else if (getSourceByID.result === false) throw getSourceByID.onfail.cerror;
      else throw getSourceByID.message;
    } catch (error) {
      ToastBar('error', error, 3000, () => { }, 'bottom-end');
    }
  };

  useEffect(() => {
    if (showLookup.show === false && isFocus.focus === true && isFocus.targetName !== '') {
      inputRef.current[isFocus.targetName].focus();
      setIsFocus({
        focus: false,
        targetName: '',
      });
    }
  }, [isFocus, setIsFocus, showLookup]);

  return {
    lookupDetails,
    showLookup,
    changeLookupDetails,
    handleOpenLookup,
    handleCloseLookup,
    handleCheckLookup,
    handleChooseLookup,
    handleStateFromLookup,
    handleStateFromLookupMany,
    inputRef,
    isFocus,
    setIsFocus,
  };
}
