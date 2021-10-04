import React, { memo, useEffect } from 'react';
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
import ActionIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
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
import ToastBar from '../../../components/ToastBar';
import { subtotaler } from '../../../utils/calculate';
import useResponsive from '../../../hooks/useResponsive';
import useFormsItem from '../../../hooks/useFormsItem';
import useLookupsItemStock from '../../../hooks/useLookupsItemStock';


import { BSOFITEM } from '../model/bso_field';

export default memo(function BSOForm_Items({
  items,
  dispatchItems,
  initQtyItemKey,
  initLineItemsInfo,
  isLoginPopup,
  handleOpenLoginPopup,
  isEditItem,
  setIsEditItem,
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
        backgroundColor: theme.palette.action.hover,
      },
      '&& :focus-within': {
        backgroundColor: theme.palette.primary.light,
      },
      '& .MuiTableCell-body': {
        paddingTop: theme.spacing(0.7),
        paddingBottom: theme.spacing(0.3),
      },
    },
  };

  const {
    handleAddItem,
    handleRemoveItem,
    handleChangeString,
    handleChangeNumber,
    handleIncreaseNumber,
    handleDecreaseNumber,
    handleChangeCurrency,
    handleChangeDiscAmount,
    isAddItem,
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
          () =>
            setIsFocusStock({
              focus: true,
              targetName: name,
              targetIndex: index,
            }),
          smDown ? 'bottom-end' : 'top-end'
        );
      } else {
        handleCheckItemStock(value, index, name, nextfocus);
      }
    }
  };

  const handleValidationNumber = (value, index, name, label) => {
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
          smDown ? 'bottom-end' : 'top-end'
        );
      }
    }
  };

  useEffect(() => {
    if (isAddItem && items.length !== 0) {
      itemsIDRef.current[BSOFITEM.CSTOCODE + '_' + (items.length - 1)].focus();
    }
  }, [items.length, itemsIDRef, isAddItem]);

  return (
    <>
      {lookupItemStockElem()}
      <Container maxWidth="lg" sx={{ mt: 1 }}>
        {smDown ? (
          <Grid container spacing={2}>
            <Grid item container xs={12} direction="row" spacing={1}>
              {items.map((item, index) => (
                <Grid item key={('bso_items_card_' + index).toString()}>
                  <Card elevation={4}>
                    <CardContent>
                      <Grid container spacing={1}>
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
                          enterEvent={handleOpenItemStock}
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
                        />
                        <InputCardText
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.CUOM + '_' + index] = el)}
                          label="Satuan"
                          name={BSOFITEM.CUOM}
                          type="text"
                          change={handleChangeString}
                          value={item[BSOFITEM.CUOM]}
                        />
                        <InputCardCurrency
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.NHRGJUA + '_' + index] = el)}
                          label={'Harga (Rp.)'}
                          name={BSOFITEM.NHRGJUA}
                          change={handleChangeCurrency}
                          blur={handleValidationNumber}
                          value={item[BSOFITEM.NHRGJUA]}
                          setIsEditItem={setIsEditItem}
                        />
                        <InputCardDecimal
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.NQSO + '_' + index] = el)}
                          label={'Qty'}
                          name={BSOFITEM.NQSO}
                          increase={handleIncreaseNumber}
                          decrease={handleDecreaseNumber}
                          change={handleChangeNumber}
                          blur={handleValidationNumber}
                          value={item[BSOFITEM.NQSO]}
                          setIsEditItem={setIsEditItem}
                        />
                        <InputCardDecimal
                          index={index}
                          label={'Disc (%)'}
                          name={BSOFITEM.NDISC}
                          increase={handleIncreaseNumber}
                          decrease={handleDecreaseNumber}
                          change={handleChangeNumber}
                          value={item[BSOFITEM.NDISC]}
                          setIsEditItem={setIsEditItem}
                        />
                        <InputCardCurrency
                          index={index}
                          ref={(el) => (itemsIDRef.current[BSOFITEM.NRPDISC + '_' + index] = el)}
                          label={'Disc. Amount (Rp.)'}
                          name={BSOFITEM.NRPDISC}
                          change={handleChangeDiscAmount}
                          value={item[BSOFITEM.NRPDISC]}
                          setIsEditItem={setIsEditItem}
                        />
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ px: 2, py: 0, background: '#eaeaea' }}>
                      <Grid container justifyContent="space-between">
                        <Grid item container xs={10} justifyContent="start" alignContent="center">
                          <Typography pt={'8px'}>Subtotal :&nbsp;Rp</Typography>
                          <CurrencyFormat
                            from="table"
                            value={subtotaler(
                              item[BSOFITEM.NHRGJUA] || 0,
                              item[BSOFITEM.NQSO] || 0,
                              item[BSOFITEM.NRPDISC] || 0
                            )}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton
                            onClick={() => handleRemoveItem(index)}
                            size="small"
                            disabled={isEditItem}
                          >
                            <DeleteIcon color={isEditItem ? 'disabled' : 'error'} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Grid item container xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleAddItem}
                disabled={isEditItem}
              >
                Tambah Item
              </Button>
            </Grid>
          </Grid>
        ) : (
          <TableWrapperSimple>
            <TableHead>
              <TableRow sx={styles.headCell}>
                <TableCell align="center">Kode</TableCell>
                <TableCell align="center">Nama Item</TableCell>
                <TableCell align="center">Satuan</TableCell>
                <TableCell align="center">Harga (Rp)</TableCell>
                <TableCell align="center">Qty</TableCell>
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
                <TableRow key={('bso_items_' + index).toString()} sx={styles.bodyCell}>
                  <TableCell align="center" component="th" scope="row">
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
                      enterEvent={handleOpenItemStock}
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
                    />
                  </TableCell>
                  <TableCell align="right">
                    <InputTableCurrency
                      index={index}
                      ref={(el) => (itemsIDRef.current[BSOFITEM.NHRGJUA + '_' + index] = el)}
                      name={BSOFITEM.NHRGJUA}
                      change={handleChangeCurrency}
                      blur={handleValidationNumber}
                      value={item[BSOFITEM.NHRGJUA]}
                      setIsEditItem={setIsEditItem}
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
                      blur={handleValidationNumber}
                      value={item[BSOFITEM.NQSO]}
                      setIsEditItem={setIsEditItem}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <InputTableDecimal
                      index={index}
                      name={BSOFITEM.NDISC}
                      increase={handleIncreaseNumber}
                      decrease={handleDecreaseNumber}
                      change={handleChangeNumber}
                      value={item[BSOFITEM.NDISC]}
                      setIsEditItem={setIsEditItem}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <InputTableCurrency
                      index={index}
                      name={BSOFITEM.NRPDISC}
                      change={handleChangeDiscAmount}
                      value={item[BSOFITEM.NRPDISC]}
                      setIsEditItem={setIsEditItem}
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
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleRemoveItem(index)}
                      size="small"
                      disabled={isEditItem}
                    >
                      <DeleteIcon color={isEditItem ? 'disabled' : 'error'} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleAddItem}
                    disabled={isEditItem}
                  >
                    Tambah Item
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </TableWrapperSimple>
        )}
      </Container>
    </>
  );
});
