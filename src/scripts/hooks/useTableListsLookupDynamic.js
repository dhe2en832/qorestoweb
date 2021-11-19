import { useState, useEffect } from 'react';
import Config from '../Config'
import AlertDialogNested from '../components/AlertDialogNested';
import { typesError } from '../utils/types-error';
import useSearch from './useSearch';
// import usePopupFormAdd from './usePopupFormAdd';

export default function useTableListsLookupDynamic({
  dataSource,
  headCells,
  confPrimKey,
  confSecKey,
  confName,
  sortDataBy,
  isLoginPopup,
  handleOpenLoginPopup,
}) {
  const idElemLookup = `Lookup${confName.replace(/\/| /g, '')}`;
  const [columns, setColumns] = useState([]);
  const [lists, setLists] = useState([]);
  const [listCount, setListCount] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [openKeySearchDlg, setOpenKeySearchDlg] = useState(false);
  const [indexKey, setIndexKey] = useState(2);
  const [openTextFilterDlg, setOpenTextFilterDlg] = useState(false);
  const [textFilter, setTextFilter] = useState('');
  const { search, handleSearch } = useSearch();
  const [submitSearch, setSubmitSearch] = useState({ submitted: false, value: '' });
  const searchLabel = sortDataBy
    .filter((data) => data.index === indexKey)
    .map((label) => label.title)[0];
  const [loading, setLoading] = useState(false);
  const [dense, setDense] = useState(false);
  const [useBRWDEF, setUseBRWDEF] = useState(Config.USE_BRWDEF);

  const handleSubmitSearch = () => {
    setSubmitSearch({
      submitted: true,
      value: search,
    });
    setListCount(null);
    setOffset(0);
    setPage(0);
  };

  const handleTextFilter = (value) => {
    setTextFilter(value);
    setListCount(null);
    setOffset(0);
    setPage(0);
  };

  useEffect(() => {
    let isActive = true;
    const getList = async () => {
      try {
        setLoading(true);
        const listFieldsMap = headCells.map((head) => head.id);
        const dataOptions = {
          offset,
          limit: listCount === null ? 0 : limit,
          usebrwdef: useBRWDEF,
          listfields: listFieldsMap,
          query: {
            keysearch: {
              index: indexKey,
              search: submitSearch.value,
            },
            textfilter: {
              search: textFilter,
            },
          },
        };
        const getDatas = await dataSource.getList(dataOptions);
        if (getDatas.result === true) {
          if (listCount === null) setListCount(getDatas.metadata.total);
          else if (getDatas.columns) {
            setColumns(getDatas.columns)
            setLists(getDatas.data)
          }
          else {
            setUseBRWDEF(false);
            setLists(getDatas.data);
          }
        } else if (getDatas.result === false) {
          throw getDatas.onfail.cerror;
        } else throw getDatas.message;
      } catch (error) {
        switch (error) {
          case typesError.SECRET_INVALID.msg:
            AlertDialogNested(
              idElemLookup,
              'error',
              ...typesError.SECRET_INVALID.res,
              handleOpenLoginPopup
            );
            break;
          case typesError.SESSION_INVALID.msg:
            AlertDialogNested(
              idElemLookup,
              'error',
              ...typesError.SESSION_INVALID.res,
              handleOpenLoginPopup
            );
            break;
          case typesError.SESSION_LOCKED.msg:
            typesError.SESSION_LOCKED.func();
            break;
          case typesError.SESSION_TIMEOUT.msg:
            AlertDialogNested(
              idElemLookup,
              'error',
              ...typesError.SESSION_TIMEOUT.res,
              handleOpenLoginPopup
            );
            break;
          case typesError.FETCH.msg:
            AlertDialogNested(idElemLookup, 'error', 'Salah', typesError.FETCH.res);
            break;
          default:
            AlertDialogNested(idElemLookup, 'error', 'Salah', error);
            break;
        }
      } finally {
        setLoading(false);
      }
    };
    // if (showPopupFormAdd === false && isLoginPopup === false) getList();
    if (isLoginPopup === false && isActive === true) getList();
    return () => isActive = false;
  }, [
    dataSource,
    headCells,
    listCount,
    useBRWDEF,
    indexKey,
    confName,
    idElemLookup,
    offset,
    limit,
    submitSearch,
    textFilter,
    isLoginPopup,
    handleOpenLoginPopup,
  ]);

  return {
    idElemLookup,
    loading,
    searchLabel,
    handleSearch,
    handleSubmitSearch,
    openKeySearchDlg,
    setOpenKeySearchDlg,
    indexKey,
    setIndexKey,
    openTextFilterDlg,
    setOpenTextFilterDlg,
    handleTextFilter,
    columns,
    lists,
    listCount,
    setListCount,
    setOffset,
    limit,
    setLimit,
    page,
    setPage,
    dense,
    setDense,
    useBRWDEF,
  };
}
