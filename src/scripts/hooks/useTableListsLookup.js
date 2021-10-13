import { useState, useEffect } from 'react';
import AlertDialogNested from '../components/AlertDialogNested';
import { typesError } from '../utils/types-error';
import useSearch from './useSearch';
// import usePopupFormAdd from './usePopupFormAdd';

export default function useTableListsLookup({
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
  const [lists, setLists] = useState([]);
  const [listCount, setListCount] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
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
    const getList = async () => {
      try {
        setLoading(true);
        const listFieldsMap = headCells.map((head) => head.id);
        const dataOptions = {
          offset,
          limit: listCount === null ? 0 : limit,
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
          else setLists(getDatas.data);
        } else if (getDatas.result === false) {
          throw getDatas.onfail.cerror;
        } else throw getDatas.message;
      } catch (error) {
        switch (error) {
          case typesError.SECRET_KEY.msg:
            AlertDialogNested(
              idElemLookup,
              'error',
              ...typesError.SECRET_KEY.res,
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
            typesError.SESSION_LOCKED.res();
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
          case typesError.ITEMS.msg:
            AlertDialogNested(idElemLookup, 'error', 'Salah', typesError.ITEMS.res);
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
    if (isLoginPopup === false) getList();
    return () => {
      setLists([]);
    };
  }, [
    dataSource,
    headCells,
    listCount,
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
    lists,
    listCount,
    setListCount,
    setOffset,
    limit,
    setLimit,
    page,
    setPage,
  };
}
