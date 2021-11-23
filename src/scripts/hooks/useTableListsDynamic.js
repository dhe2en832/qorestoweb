import { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Config from '../Config'
import AlertDialog from '../components/AlertDialog';
// import ConfirmDialog from '../components/ConfirmDialog';
import { typesError } from '../utils/types-error';
import useSearch from './useSearch';
import useRedirectToLogin from './useRedirectToLogin';

export default function useTableListsDynamic({
  dataSource,
  headCells,
  confPrimKey,
  confName,
  sortDataBy,
}) {
  const url = useRouteMatch().path;
  const { redirectToLogin } = useRedirectToLogin();
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

  //#region handleDelete
  // const handleDelete = (event, id) => {
  //   event.preventDefault();
  //   ConfirmDialog(
  //     'Apakah anda yakin menghapus?',
  //     `Data ${initName} tidak akan bisa dikembalikan`,
  //     'Ya, Hapus',
  //     async () => {
  //       try {
  //         const deleteDatas = await dataSource.delete(id);
  //         AlertDialog(
  //           'success',
  //           `Berhasil Menghapus Data ${initName}`,
  //           <p>
  //             Data {initName} dengan ID/Kode: "{id}" telah terhapus.
  //           </p>,
  //           () => {
  //             const numericHead = headCells.filter((headCell) => headCell.numeric === true);
  //             if (numericHead.length > 0) {
  //               const undeletedDataWithNumeric = deleteDatas.onsuccess.data.map((getDataNum) => {
  //                 numericHead.map(
  //                   (numHead) => (getDataNum[numHead.id] = parseFloat(getDataNum[numHead.id]))
  //                 );
  //                 return getDataNum;
  //               });
  //               setLists(undeletedDataWithNumeric);
  //             } else {
  //               setLists(deleteDatas.onsuccess.data);
  //             }
  //           }
  //         );
  //       } catch (error) {}
  //     }
  //   );
  // };
  //#endregion

  useEffect(() => {
    let isActive = true;
    const getLists = async () => {
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
            AlertDialog('error', ...typesError.SECRET_INVALID.res, redirectToLogin);
            break;
          case typesError.SESSION_INVALID.msg:
            AlertDialog('error', ...typesError.SESSION_INVALID.res, redirectToLogin);
            break;
          case typesError.SESSION_LOCKED.msg:
            typesError.SESSION_LOCKED.func();
            break;
          case typesError.SESSION_TIMEOUT.msg:
            AlertDialog('error', ...typesError.SESSION_TIMEOUT.res, redirectToLogin);
            break;
          case typesError.FETCH.msg:
            AlertDialog('error', 'Salah', typesError.FETCH.res);
            break;
          default:
            AlertDialog('error', 'Salah', error);
            break;
        }
      } finally {
        setLoading(false);
      }
    };
    if (isActive === true) getLists();
    return () => isActive = false;
  }, [
    dataSource,
    headCells,
    listCount,
    useBRWDEF,
    indexKey,
    confName,
    offset,
    limit,
    submitSearch,
    setSubmitSearch,
    textFilter,
    redirectToLogin,
  ]);

  return {
    url,
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
