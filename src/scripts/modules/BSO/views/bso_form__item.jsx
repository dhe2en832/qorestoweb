import React, { memo, useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grow from '@mui/material/Grow';
import ActionIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TableWrapperSimple from '../../../components/TableWrapperSimple';
import InputTableText from '../../../components/InputTableText';
import InputTableTextComplex from '../../../components/InputTableTextComplex';
import InputCardCurrency from '../../../components/InputCardCurrency';
import InputCardDecimal from '../../../components/InputCardDecimal';
import InputCardText from '../../../components/InputCardText';
import InputCardTextComplex from '../../../components/InputCardTextComplex';
import InputTableCurrency from '../../../components/InputTableCurrency';
import InputTableDecimal from '../../../components/InputTableDecimal';
import CurrencyFormat from '../../../components/CurrencyFormat';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ToastBar from '../../../components/ToastBar';
import { subtotaler } from '../../../utils/calculate';
import useResponsive from '../../../hooks/useResponsive';
import useFormsItem from '../../../hooks/useFormsItem';
import useLookupsItemStock from '../../../hooks/useLookupsItemStock';

import { BSOFITEM } from '../model/bso_field';
import bitmso_api from '../../BSO/controller/bitmso_api';
import { typesError } from '../../../utils/types-error';

export default memo(function BSOForm_Items({
  salesOrderID,
  warehouseID,
  items,
  dispatchItems,
  initQtyItemKey,
  initLineItemsInfo,
  isLoginPopup,
  handleOpenLoginPopup,
  isEditItem,
  setIsEditItem,
  setOpenHeader,
  isSavedHeader,
  isSubmit,
}) {
  const { theme, smDown } = useResponsive();
  const styles = {
    headCell: {
      '& .MuiTableCell-head': {
        backgroundColor: theme.palette.custom.thBackground,
        color: theme.palette.custom.thText,
        fontWeight: 'bold',
      },
    },
    bodyCell: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.grey[100],
      },
      '&& :focus-within': {
        backgroundColor: theme.palette.secondary.light,
      },
      '& .MuiTableCell-body': {
        paddingTop: theme.spacing(0.7),
        paddingBottom: theme.spacing(0.3),
      },
      ':focus-within': {
        backgroundColor: 'rgb(0 190 255 / 16%)',
      },
    },
  };
  const [isChangeItem, setIsChangeItem] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [indexItem, setIndexItem] = useState(-1);
  const [hideSaveItem, setHideSaveItem] = useState(true);
  const [disableSaveItem, setDisableSaveItem] = useState(false);
  const [tempItem, setTempItem] = useState({});
  const disableAdd = isSubmit ? true : isSavedHeader ? (hideSaveItem ? false : true) : true;
  const disableCheck = (index) => {
    if (isChangeItem && indexItem !== index) return true;
    else return false;
  };
  const disableDeleteCheck = (index) => {
    if (isNewItem) return true;
    else return disableCheck(index);
  };
  const resetStateItem = () => {
    setIsAddItem(false);
    setIsChangeItem(false);
    setIsNewItem(false);
    setIndexItem(-1);
    setHideSaveItem(true);
    setDisableSaveItem(false);
    setTempItem({});
  };

  const {
    handleAddItem,
    handleRemoveItem,
    handleRevertItem,
    handleChangeString,
    handleChangeNumber,
    handleIncreaseNumber,
    handleDecreaseNumber,
    handleChangeCurrency,
    handleChangeDiscAmount,
    isAddItem,
    setIsAddItem,
  } = useFormsItem({
    dispatchItems,
    initQtyItemKey,
    initLineItemsInfo,
  });

  const {
    lookupItemStockElem,
    handleOpenItemStock,
    handleCheckItemStock,
    itemsIDRef,
    isFocusStock,
    setIsFocusStock,
  } = useLookupsItemStock({
    items,
    dispatchItems,
    initQtyItemKey,
    isLoginPopup,
    handleOpenLoginPopup,
  });

  const handleValidationItems = (value, index, name, nextfocus, label) => {
    if (isFocusStock.focus === false) {
      if (value === '') {
        ToastBar(
          'error',
          `${label || name} tidak boleh kosong!`,
          3000,
          async () =>
            await setIsFocusStock({
              focus: true,
              targetName: name,
              targetIndex: index,
            }),
          'bottom-end'
        );
        handleOpenItemStock(index, name, nextfocus);
      } else {
        if (name === BSOFITEM.CSTOCODE && value !== tempItem[BSOFITEM.CSTOCODE])
          handleCheckItemStock(value, index, name, nextfocus);
      }
    }
  };

  const handleValidationQty = (value, index, name, label) => {
    if (isFocusStock.focus === false) {
      if (value === 0 || value === '0.00' || value === '') {
        ToastBar(
          'error',
          `${label || name} tidak boleh nol!`,
          3000,
          () =>
            setIsFocusStock({
              focus: true,
              targetName: name,
              targetIndex: index,
            }),
          'bottom-end'
        );
      }
    }
  };

  const handleValidationCurrency = (value, index, name, label) => {
    if (isFocusStock.focus === false) {
      if (value === '') {
        ToastBar(
          'error',
          `${label || name} tidak boleh kosong!`,
          3000,
          () =>
            setIsFocusStock({
              focus: true,
              targetName: name,
              targetIndex: index,
            }),
          'bottom-end'
        );
      }
    }
  };

  const handleValidationDisc = (value, index, name, label) => {
    if (isFocusStock.focus === false) {
      if (parseFloat(value) > 100) {
        ToastBar(
          'error',
          `${label || name} tidak boleh lebih dari 100!`,
          3000,
          () =>
            setIsFocusStock({
              focus: true,
              targetName: name,
              targetIndex: index,
            }),
          'bottom-end'
        );
      }
    }
  };

  const handleEnterEvent = (index, name) => {
    itemsIDRef.current[name + '_' + index.toString()].blur();
  };

  const handleFocusItem = (event, index) => {
    if (event.target.name !== 'buttonIcon' || event.target.name !== BSOFITEM.NLINE) {
      if (indexItem !== index && isChangeItem === false) {
        setIsChangeItem(true);
        setIndexItem(index);
        setHideSaveItem(false);
        setTempItem({ ...items[index] });
      } else if (indexItem !== index && isChangeItem === true) {
        const targetNameCheck = () => {
          if (event.target.name === BSOFITEM.NLINE) return BSOFITEM.BSOFITEM.CSTOCODE;
          else return event.target.name;
        };
        setIsFocusStock({
          focus: true,
          targetIndex: indexItem,
          targetName: targetNameCheck() || BSOFITEM.CSTONAME,
        });
      }

      if (event.target.name === BSOFITEM.CSTOCODE && event.target.value === '') {
        setDisableSaveItem(true);
      } else {
        setDisableSaveItem(false);
      }
    }
  };

  const handleCreateItem = () => {
    handleAddItem();
    setOpenHeader(false);
    setIsChangeItem(true);
    setIsNewItem(true);
    setIndexItem(items.length);
    setHideSaveItem(false);
    setTempItem({});
  };

  const handleDeleteItem = (index) => {
    ConfirmDialog(
      `Hapus Item`,
      `Apakah anda yakin menghapus item line no. ${items[index][BSOFITEM.NLINE]}?`,
      'Ya',
      async () => {
        try {
          const dataOptions = {
            key: {
              csonum: salesOrderID,
              nline: items[index][BSOFITEM.NLINE],
            },
          };
          const fetchDelete = await bitmso_api.delrec(dataOptions);
          if (fetchDelete.result === true) {
            ToastBar(
              'success',
              `Hapus Item Line No. ${items[index][BSOFITEM.NLINE]} Berhasil`,
              3000,
              () => {
                handleRemoveItem(index);
                resetStateItem();
              },
              'bottom-end'
            );
          } else if (fetchDelete.result === false) throw fetchDelete.onfail.cerror;
          else throw fetchDelete.message;
        } catch (error) {
          ToastBar(
            'error',
            `Gagal. ${error}`,
            3000,
            () => {
              resetStateItem();
            },
            'bottom-end'
          );
        }
      }
    );
  };

  const handleSaveItem = async () => {
    try {
      const { nline, cstocode, cstoname, cuom, nqso, nhrgjua, ndisc, nrpdisc } = items[indexItem];
      const floatQty = parseFloat(nqso);
      const floatPrice = parseFloat(nhrgjua);
      const floatDiscPercent = parseFloat(ndisc);
      const floatDiscAmount = parseFloat(nrpdisc);
      const dataOptions = {
        ...(isNewItem === false && {
          key: {
            csonum: salesOrderID,
            nline,
          },
        }),
        data: {
          ...(isNewItem && {
            csonum: salesOrderID,
            cwhseid: warehouseID,
            nline,
          }),
          cstocode,
          cstoname,
          cuom,
          nqso: floatQty,
          nhrgjua: floatPrice,
          ndisc: floatDiscPercent,
          nrpdisc: floatDiscAmount,
        },
      };
      let fetchPost;
      if (isNewItem) {
        fetchPost = await bitmso_api.addrec(dataOptions);
      } else {
        fetchPost = await bitmso_api.updrec(dataOptions);
      }
      if (fetchPost.result === true) {
        ToastBar(
          'success',
          `${isNewItem ? 'Tambah' : 'Ubah'} Item Baris ${
            items[indexItem][BSOFITEM.NLINE]
          } Berhasil`,
          3000,
          () => {
            resetStateItem();
          },
          'bottom-end'
        );
      } else if (fetchPost.result === false) throw fetchPost.onfail.cerror;
      else throw fetchPost.message;
    } catch (error) {
      switch (error) {
        case typesError.FETCH.msg:
          ToastBar('error', `${typesError.FETCH.res}`, 3000, () => {}, 'bottom-end');
          break;
        case typesError.SESSION_INVALID.msg:
        case typesError.SESSION_TIMEOUT.msg:
          ToastBar(
            'error',
            `${error}`,
            3000,
            () => {
              handleOpenLoginPopup();
              setIsFocusStock({
                focus: true,
                targetIndex: indexItem,
                targetName: BSOFITEM.CSTONAME,
              });
            },
            'bottom-end'
          );
          break;
        case typesError.SESSION_LOCKED.msg:
          ToastBar(
            'error',
            `${typesError.SESSION_LOCKED.res}`,
            3000,
            () => {
              typesError.SESSION_LOCKED.func(() =>
                setIsFocusStock({
                  focus: true,
                  targetIndex: indexItem,
                  targetName: BSOFITEM.CSTONAME,
                })
              );
            },
            'bottom-end'
          );
          break;
        default: {
          if (error.includes(typesError.ITEMS.INVALID_ITEM.msg))
            ToastBar(
              'error',
              `${typesError.ITEMS.INVALID_ITEM.resText(error)}`,
              3000,
              () =>
                setIsFocusStock({
                  focus: true,
                  targetIndex: indexItem,
                  targetName: typesError.ITEMS.INVALID_ITEM.resCode(error),
                }),
              'bottom-end'
            );
          else
            ToastBar(
              'error',
              `${error}`,
              3000,
              () =>
                setIsFocusStock({
                  focus: true,
                  targetIndex: indexItem,
                  targetName: BSOFITEM.CSTONAME,
                }),
              'bottom-end'
            );
          break;
        }
      }
    }
  };

  const handleCancelItem = () => {
    ConfirmDialog(
      'Batalkan Item',
      <p style={{ textAlign: 'center' }}>
        Apakah anda yakin akan membatalkan? <br /> Jika Item Line No.{' '}
        {items[indexItem][BSOFITEM.NLINE]} ini baru, maka akan terhapus!
      </p>,
      'Ya',
      () => {
        if (isNewItem) {
          setIsAddItem(false);
          handleRemoveItem(indexItem);
        } else handleRevertItem(indexItem, tempItem);
        resetStateItem();
      }
    );
  };

  useEffect(() => {
    if (items.length !== 0 && indexItem !== -1) {
      if (isAddItem) {
        itemsIDRef.current[BSOFITEM.CSTOCODE + '_' + indexItem].focus();
      }
    }
  }, [items.length, itemsIDRef, isAddItem, indexItem]);

  return (
    <>
      {lookupItemStockElem()}
      <Container maxWidth="lg" sx={{ mt: 1 }}>
        {smDown ? (
          <Grid container spacing={2}>
            <Grid item container xs={12} direction="row" spacing={1}>
              {items.map((item, index) => (
                <Grid item key={('bso_items_card_' + index).toString()}>
                  <Card tabIndex={-1} elevation={4}>
                    <CardContent>
                      <Grid
                        container
                        spacing={1}
                        onFocus={(event) => handleFocusItem(event, index)}
                      >
                        <InputCardText
                          index={index}
                          label="Line No."
                          name={BSOFITEM.NLINE}
                          type="text"
                          value={item[BSOFITEM.NLINE]}
                          setWidth={'9ch'}
                          disabled={true}
                        />
                        <InputCardTextComplex
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.CSTOCODE + '_' + index] = el)}
                          label="Kode"
                          name={BSOFITEM.CSTOCODE}
                          nextFocus={BSOFITEM.CSTONAME}
                          type="text"
                          change={handleChangeString}
                          blur={handleValidationItems}
                          maxLength={10}
                          value={item[BSOFITEM.CSTOCODE]}
                          setIsEditItem={setIsEditItem}
                          enterEvent={handleEnterEvent}
                          disabled={disableCheck(index)}
                        />
                        <InputCardText
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.CSTONAME + '_' + index] = el)}
                          label="Nama"
                          name={BSOFITEM.CSTONAME}
                          type="text"
                          change={handleChangeString}
                          value={item[BSOFITEM.CSTONAME]}
                          fullWidth={true}
                          disabled={disableCheck(index)}
                        />
                        <InputCardDecimal
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.NQSO + '_' + index] = el)}
                          label={'Qty'}
                          name={BSOFITEM.NQSO}
                          increase={handleIncreaseNumber}
                          decrease={handleDecreaseNumber}
                          change={handleChangeNumber}
                          blur={handleValidationQty}
                          value={item[BSOFITEM.NQSO]}
                          setIsEditItem={setIsEditItem}
                          setWidth={'19ch'}
                          disabled={disableCheck(index)}
                        />
                        <InputCardText
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.CUOM + '_' + index] = el)}
                          label="Satuan"
                          name={BSOFITEM.CUOM}
                          type="text"
                          change={handleChangeString}
                          value={item[BSOFITEM.CUOM]}
                          setWidth={'10ch'}
                          disabled={disableCheck(index)}
                        />
                        <InputCardCurrency
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.NHRGJUA + '_' + index] = el)}
                          label={'Harga (Rp.)'}
                          name={BSOFITEM.NHRGJUA}
                          change={handleChangeCurrency}
                          blur={handleValidationCurrency}
                          value={item[BSOFITEM.NHRGJUA]}
                          setIsEditItem={setIsEditItem}
                          disabled={disableCheck(index)}
                        />
                        <InputCardDecimal
                          index={index}
                          label={'Disc (%)'}
                          name={BSOFITEM.NDISC}
                          increase={handleIncreaseNumber}
                          decrease={handleDecreaseNumber}
                          change={handleChangeNumber}
                          value={item[BSOFITEM.NDISC]}
                          blur={handleValidationDisc}
                          setIsEditItem={setIsEditItem}
                          setWidth={'19ch'}
                          disabled={disableCheck(index)}
                        />
                        <InputCardCurrency
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.NRPDISC + '_' + index] = el)}
                          label={'Disc. Amount (Rp.)'}
                          name={BSOFITEM.NRPDISC}
                          change={handleChangeDiscAmount}
                          value={item[BSOFITEM.NRPDISC]}
                          setIsEditItem={setIsEditItem}
                          disabled={disableCheck(index)}
                        />
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ px: 2, py: 0, background: '#eaeaea' }}>
                      <Grid container justifyContent="space-between">
                        <Grid item container xs={10} justifyContent="start" alignContent="center">
                          <Typography pt={'8px'} color={disableCheck(index) ? 'gray' : ''}>
                            Subtotal :&nbsp;Rp
                          </Typography>
                          <CurrencyFormat
                            from="table"
                            value={subtotaler(
                              item[BSOFITEM.NHRGJUA] || 0,
                              item[BSOFITEM.NQSO] || 0,
                              item[BSOFITEM.NRPDISC] || 0
                            )}
                            disabled={disableCheck(index)}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton
                            onClick={() => !disableDeleteCheck(index) && handleDeleteItem(index)}
                            size="small"
                            disabled={disableDeleteCheck(index) || isEditItem}
                          >
                            <DeleteIcon
                              color={
                                disableDeleteCheck(index)
                                  ? 'disabled'
                                  : isEditItem
                                  ? 'disabled'
                                  : 'error'
                              }
                            />
                          </IconButton>
                        </Grid>
                        {!hideSaveItem && indexItem === index && (
                          <Grid
                            container
                            item
                            xs={12}
                            justifyContent="center"
                            mb={1}
                            p={1}
                            borderRadius={2}
                            bgcolor="whitesmoke"
                          >
                            <Grid>
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveItem}
                                disabled={disableSaveItem}
                                sx={{ mr: 2 }}
                              >
                                Simpan
                              </Button>
                            </Grid>
                            <Grid>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={handleCancelItem}
                                disabled={disableSaveItem}
                              >
                                Batal
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Grid item container xs={12}>
              {!isChangeItem && (
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleCreateItem}
                    disabled={disableAdd}
                    startIcon={<AddIcon />}
                  >
                    Tambah Item
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        ) : (
          <TableWrapperSimple>
            <TableHead>
              <TableRow sx={styles.headCell}>
                <TableCell align="center">Line No.</TableCell>
                <TableCell align="center">Kode</TableCell>
                <TableCell align="center">Nama Item</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="center">Satuan</TableCell>
                <TableCell align="center">Harga (Rp)</TableCell>
                <TableCell align="center">Discount (%)</TableCell>
                <TableCell align="center">Disc Amount (Rp)</TableCell>
                <TableCell align="center">Subtotal (Rp)</TableCell>
                <TableCell align="center">
                  <ActionIcon />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow
                  key={('bso_items_' + index).toString()}
                  sx={styles.bodyCell}
                  onFocus={(event) => handleFocusItem(event, index)}
                >
                  <TableCell align="right" component="th" scope="row">
                    <InputTableText
                      index={index}
                      name={BSOFITEM.NLINE}
                      type="text"
                      value={item[BSOFITEM.NLINE]}
                      setWidth={'1ch'}
                      disabled={true}
                    />
                  </TableCell>
                  <TableCell>
                    <InputTableTextComplex
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.CSTOCODE + '_' + index] = el)}
                      name={BSOFITEM.CSTOCODE}
                      nextFocus={BSOFITEM.CSTONAME}
                      type="text"
                      change={handleChangeString}
                      blur={handleValidationItems}
                      maxLength={10}
                      value={item[BSOFITEM.CSTOCODE]}
                      setIsEditItem={setIsEditItem}
                      setWidth={'10ch'}
                      enterEvent={handleEnterEvent}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>
                  <TableCell>
                    <InputTableText
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.CSTONAME + '_' + index] = el)}
                      name={BSOFITEM.CSTONAME}
                      type="text"
                      change={handleChangeString}
                      value={item[BSOFITEM.CSTONAME]}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <InputTableDecimal
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.NQSO + '_' + index] = el)}
                      name={BSOFITEM.NQSO}
                      increase={handleIncreaseNumber}
                      decrease={handleDecreaseNumber}
                      change={handleChangeNumber}
                      blur={handleValidationQty}
                      value={item[BSOFITEM.NQSO]}
                      setIsEditItem={setIsEditItem}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>
                  <TableCell>
                    <InputTableText
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.CUOM + '_' + index] = el)}
                      name={BSOFITEM.CUOM}
                      type="text"
                      change={handleChangeString}
                      value={item[BSOFITEM.CUOM]}
                      setWidth={'4ch'}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <InputTableCurrency
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.NHRGJUA + '_' + index] = el)}
                      name={BSOFITEM.NHRGJUA}
                      change={handleChangeCurrency}
                      blur={handleValidationCurrency}
                      value={item[BSOFITEM.NHRGJUA]}
                      setIsEditItem={setIsEditItem}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <InputTableDecimal
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.NDISC + '_' + index] = el)}
                      name={BSOFITEM.NDISC}
                      increase={handleIncreaseNumber}
                      decrease={handleDecreaseNumber}
                      change={handleChangeNumber}
                      value={item[BSOFITEM.NDISC]}
                      blur={handleValidationDisc}
                      setIsEditItem={setIsEditItem}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <InputTableCurrency
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.NRPDISC + '_' + index] = el)}
                      name={BSOFITEM.NRPDISC}
                      change={handleChangeDiscAmount}
                      value={item[BSOFITEM.NRPDISC]}
                      setIsEditItem={setIsEditItem}
                      setWidth={'11ch'}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <CurrencyFormat
                      from="table"
                      value={subtotaler(
                        item[BSOFITEM.NHRGJUA] || 0,
                        item[BSOFITEM.NQSO] || 0,
                        item[BSOFITEM.NRPDISC] || 0
                      )}
                      disabled={disableCheck(index)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      name="buttonIcon"
                      onClick={() => !disableDeleteCheck(index) && handleDeleteItem(index)}
                      size="small"
                      disabled={disableDeleteCheck(index) || isEditItem}
                    >
                      <DeleteIcon
                        color={
                          disableDeleteCheck(index) ? 'disabled' : isEditItem ? 'disabled' : 'error'
                        }
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={99}>
                  <Grid container spacing={1} justifyContent="flex-start">
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleCreateItem}
                        disabled={disableAdd}
                        startIcon={<AddIcon />}
                      >
                        Tambah Item
                      </Button>
                    </Grid>
                    <Grow in={!hideSaveItem}>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveItem}
                          disabled={disableSaveItem}
                          sx={{ mr: 1 }}
                        >
                          Simpan Item
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelItem}
                          disabled={disableSaveItem}
                        >
                          Batal Item
                        </Button>
                      </Grid>
                    </Grow>
                  </Grid>
                </TableCell>
              </TableRow>
            </TableFooter>
          </TableWrapperSimple>
        )}
      </Container>
    </>
  );
});
