import { useState, useRef, useEffect } from 'react';

export default function useLookup({
  initLookupDetails,
  dispatch,
  useActions,
  payloadScheme,
  isLoginPopup,
}) {
  const [lookupDetails, setLookupDetails] = useState(initLookupDetails || {});
  const [showLookup, setShowLookup] = useState({
    show: false,
    accessorName: '',
    nextInputName: '',
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
  const handleOpenLookup = (accessorName, nextInputName) => {
    setShowLookup({
      show: true,
      accessorName,
      nextInputName,
    });
  };
  const handleCloseLookup = (isChoosed = false) => {
    try {
      if (isChoosed === true)
        setIsFocus({
          focus: true,
          targetName: showLookup.nextInputName,
        });
      else {
        setIsFocus({
          focus: true,
          targetName: showLookup.accessorName,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowLookup({
        show: false,
        name: '',
        nextInputName: '',
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
  const handleCheckLookup = async (
    id,
    accessorName,
    nextInputName,
    dataSource,
  ) => {
    if (
      showLookup.show === false &&
      isLoginPopup === false &&
      isFocus.focus === false
    ) {
      try {
        const getSourceByID = await dataSource.getById(id || 'null');
        if (getSourceByID.result === true) {
          payloadScheme({
            accessorName,
            changeLookupDetails,
            handleStateFromLookup,
            handleStateFromLookupChild,
            handleStateFromLookupMany,
            row: getSourceByID.onsuccess.data,
          });
        } else {
          handleOpenLookup(accessorName, nextInputName);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      return false;
    }
  };
  const handleChooseLookup = (event, row) => {
    event.preventDefault();
    payloadScheme({
      accessorName: showLookup.accessorName,
      changeLookupDetails,
      handleStateFromLookup,
      handleStateFromLookupChild,
      handleStateFromLookupMany,
      row,
    });
    handleCloseLookup(true);
  };

  useEffect(() => {
    if (isFocus.focus === true && isFocus.targetName !== '') {
      inputRef.current[isFocus.targetName].focus();
      setIsFocus({
        focus: false,
        targetName: '',
      });
    }
  }, [isFocus, setIsFocus]);

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
