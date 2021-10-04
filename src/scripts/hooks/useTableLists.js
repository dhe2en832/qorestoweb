import { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { typesError } from '../utils/types-error';
import useSearch from './useSearch';
import useRedirectToLogin from './useRedirectToLogin';

export default function useTableLists({ dataSource, headCells, confPrimKey, confName }) {
  const url = useRouteMatch().path;
  const { redirectToLogin } = useRedirectToLogin();
  const listfields = new Array(headCells.map((thead) => thead.id));
  console.log(listfields);
  const [lists, setLists] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(0);
  const [filterBy, setFilterBy] = useState(confPrimKey);
  const { search, handleSearch } = useSearch();
  const [textFilter, setTextFilterBy] = useState('');
  const searchLabel = headCells.filter((data) => data.id === filterBy).map((label) => label.label);
  const [loading, setLoading] = useState(false);

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
    const getLists = async () => {
      try {
        setLoading(true);
        const listFieldsMap = headCells.map((head) => head.id);
        const dataOptions = {
          offset,
          limit,
          listfields: listFieldsMap,
          query: {},
        };
        console.log(dataOptions);
        const getDatas = await dataSource.getList(dataOptions);
        if (getDatas.result === true) {
          setLists(getDatas.data);
        } else if (getDatas.result === false) {
        } else {
          throw getDatas.message;
        }
      } catch (error) {
        switch (error) {
          case typesError.SECRET_KEY.msg:
            AlertDialog('error', 'Session Telah Habis.', <p>Gagal Ambil Data {confName}</p>);
            break;
          case typesError.FETCH.msg:
            AlertDialog('error', 'Terjadi Kesalahan', typesError.FETCH.res);
            break;
          case typesError.ITEMS.msg:
            AlertDialog('error', 'Terjadi Kesalahan', typesError.ITEMS.res);
            break;
          default:
            AlertDialog('error', 'Terjadi Kesalahan', error);
            break;
        }
      } finally {
        setLoading(false);
      }
    };
    getLists();
    return () => {
      setLists([]);
    };
  }, [dataSource, headCells, redirectToLogin, filterBy, confName, offset, limit]);

  return {
    url,
    loading,
    searchLabel,
    handleSearch,
    filterBy,
    setFilterBy,
    lists,
    offset,
    limit,
  };
}
