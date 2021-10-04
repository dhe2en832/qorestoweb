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
  const idElem = `Lookup${confName.replace(/\/| /g, '')}`;
  const [lists, setLists] = useState([]);
  const [listCount, setListCount] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const [indexKey, setIndexKey] = useState(2);
  const [textFilter, setTextFilterBy] = useState('');
  const { search, handleSearch } = useSearch();
  const [submitSearch, setSubmitSearch] = useState({ submitted: false, value: '' });
  const searchLabel = sortDataBy
    .filter((data) => data.index === indexKey)
    .map((label) => label.title);
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
        console.log(dataOptions);
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
              idElem,
              'error',
              'Session Telah Habis.',
              <p>Gagal Lookup Data {confName}</p>,
              () => handleOpenLoginPopup()
            );
            break;
          case typesError.FETCH.msg:
            AlertDialogNested(idElem, 'error', 'Terjadi Kesalahan', typesError.FETCH.res);
            break;
          case typesError.ITEMS.msg:
            AlertDialogNested(idElem, 'error', 'Terjadi Kesalahan', typesError.ITEMS.res);
            break;
          default:
            AlertDialogNested(idElem, 'error', 'Terjadi Kesalahan', error);
            break;
        }
      } finally {
        setLoading(false);
      }
    };
    // if (showPopupFormAdd === false && isLoginPopup === false) getList();
    isLoginPopup === false && getList();
    return () => {
      setLists([]);
    };
  }, [
    dataSource,
    headCells,
    listCount,
    indexKey,
    confName,
    idElem,
    offset,
    limit,
    submitSearch,
    setSubmitSearch,
    textFilter,
    isLoginPopup,
    handleOpenLoginPopup,
  ]);

  return {
    idElem,
    loading,
    searchLabel,
    handleSearch,
    handleSubmitSearch,
    indexKey,
    setIndexKey,
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
