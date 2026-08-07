import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import NoteIcon from '@mui/icons-material/NoteAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TrashIcon from '@mui/icons-material/DeleteOutline';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import CashierIcon from '@mui/icons-material/PointOfSale';
import SelfPayIcon from '@mui/icons-material/PhoneAndroid';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Placeholder from '../../../../images/placeholder.png';
import useResponsive from '../../../hooks/useResponsive';
import { toCurrencyIDR } from '../../../utils/formatter';
import ToastBar from '../../../components/ToastBar';
import bqo_api from '../controllers/bqo_api';
import usePrintReceipt from '../hooks/usePrintReceipt';
import BQOOrderSlip from '../reports/BQOOrderSlip';

const TAX_PERCENT = 11;
export default function BQOCheckout() {
  const { smUp } = useResponsive();
  const navigate = useNavigate();
  const styles = {
    container: {
      background: '#eee',
      paddingTop: smUp ? '25px' : '15px',
      height: '100%',
      paddingBottom: 100,
    },
    appBar: {
      backgroundColor: '#fff',
    },
    appBarIcon: {
      color: '#3f50b5',
    },
    imageList: {
      height: smUp ? '85px' : '75px',
      width: smUp ? '85px' : '75px',
      objectFit: 'cover',
    },
    qtyInput: {
      '& .MuiOutlinedInput-root': {
        padding: 0,
      },
      '& .MuiInputBase-input': {
        padding: '8px',
        width: '4ch',
        margin: 0,
        borderLeft: '1px solid #b7b7b7',
        borderRight: '1px solid #b7b7b7',
        textAlign: 'center',
      },
    },
    adornIcon: {
      cursor: 'pointer',
      color: '#3f50b5',
    },
    trashButton: {
      padding: 0,
      minWidth: '44px',
      mr: 4,
    },
    noteButton: {
      padding: 0,
      minWidth: '44px',
      mr: 2,
    },
    noteForm: {
      '& .MuiInputBase-root': {
        padding: 1,
      },
    },
  };

  // Dialog
  const [showDialog, setShowDialog] = useState({
    isShow: false,
    isForm: false,
    accessorID: '',
  });
  const handleCloseDialog = () => {
    setShowDialog({
      isShow: false,
      isForm: false,
      accessorID: '',
    });
  };
  const handleOpenDialog = (isForm, accessorID) => {
    setShowDialog({
      isShow: true,
      isForm,
      accessorID,
    });
  };

  // Info Order
  const [info, setInfo] = useState({
    seatNumber: '',
    orderByName: '',
    phoneNumber: '',
  });

  const handleChangeInfo = (event) => {
    setInfo({
      ...info,
      [event.target.name]: event.target.value,
    });
  };

  // Cart
  const [cart, setCart] = useState(JSON.parse(window.localStorage.getItem('QoCart')) || {});
  const removeItem = (id) => {
    delete cart[id];
    setCart({ ...cart });
  };
  const increaseQtyItem = (event, data) => {
    event.stopPropagation();
    setCart({
      ...cart,
      [data.id]: {
        item: data,
        qty: cart[data.id].qty + 1,
        ...(cart[data.id].note && { note: cart[data.id].note }),
      },
    });
  };
  const decreaseQtyItem = (event, data) => {
    event.stopPropagation();
    const qtyItem = cart[data.id].qty;
    setCart({
      ...cart,
      [data.id]: {
        item: data,
        qty: qtyItem === 1 ? 1 : qtyItem - 1,
        ...(cart[data.id].note && { note: cart[data.id].note }),
      },
    });
  };
  // const calculateQtyItem = () => {
  //     let totalQty = 0
  //     Object.values(cart).forEach((data) => totalQty = totalQty + data.qty);
  //     return totalQty;
  // }
  const calculatePriceItem = () => {
    let totalPrice = 0;
    Object.values(cart).forEach(
      (data) => (totalPrice = totalPrice + parseFloat(data.item.sellPrice) * data.qty)
    );
    return totalPrice;
  };
  const calculateTaxItem = () => {
    return Math.floor(parseFloat(calculatePriceItem() * (TAX_PERCENT / 100)));
  };
  const changeQtyItem = (event, data) => {
    event.stopPropagation();
    const newValue = event.target.value;
    if (parseInt(newValue) === 0) {
      removeItem(data);
    } else {
      setCart({
        ...cart,
        [data.id]: {
          item: data,
          qty: newValue === '' ? 1 : parseInt(newValue),
          ...(cart[data.id].note && { note: cart[data.id].note }),
        },
      });
    }
  };
  const selectedQtyItem = (event) => {
    event.stopPropagation();
    event.target.select();
  };
  useEffect(() => {
    window.localStorage.setItem('QoCart', JSON.stringify(cart));
    Object.entries(cart).length === 0 && navigate('/menu');
  }, [cart, navigate]);

  // Note Form
  const [noteValue, setNoteValue] = useState('');
  const isNoteExist = (id) => {
    const dataCheck = cart[id].note;
    return dataCheck ? true : false;
  };
  const handleChangeNoteValue = (event) => {
    setNoteValue(event.target.value);
  };
  const handleOpenNoteForm = (accessorID) => {
    isNoteExist(accessorID) && setNoteValue(cart[accessorID].note);
    handleOpenDialog(true, accessorID);
  };
  const handleCloseNoteForm = () => {
    setNoteValue('');
    handleCloseDialog();
  };
  const handleSaveNoteForm = () => {
    if (noteValue !== '') {
      setCart({
        ...cart,
        [showDialog.accessorID]: {
          item: cart[showDialog.accessorID].item,
          qty: cart[showDialog.accessorID].qty,
          note: noteValue,
        },
      });
    } else {
      setCart({
        ...cart,
        [showDialog.accessorID]: {
          item: cart[showDialog.accessorID].item,
          qty: cart[showDialog.accessorID].qty,
        },
      });
    }
    handleCloseNoteForm();
  };

  const showValidation = (title) => {
    ToastBar('error', `${title} Harus Diisi.`);
  };

  // Dialog pilihan metode bayar: kasir vs mandiri
  const [showPaymentMethodDlg, setShowPaymentMethodDlg] = useState(false);

  // Dialog konfirmasi pesanan kasir + struk
  const [kasirResult, setKasirResult] = useState(null); // { nomorBon, cartItems, subtotal, taxAmount, total }
  const { printComponentRef, handlePrint, printCount } = usePrintReceipt();

  const handleOnCheckout = () => {
    if (info.seatNumber === '') {
      showValidation('Nomor Meja');
      return;
    }
    if (info.orderByName === '') {
      showValidation('Nama Pemesan');
      return;
    }
    if (info.phoneNumber === '') {
      showValidation('Nomor Telepon');
      return;
    }
    // Tampilkan dialog pilihan: bayar di kasir atau mandiri
    setShowPaymentMethodDlg(true);
  };

  // Bayar di kasir — submit pesanan ke backend, lalu tampilkan struk
  const [isSubmittingKasir, setIsSubmittingKasir] = useState(false);
  const handlePayAtKasir = async () => {
    setShowPaymentMethodDlg(false);
    setIsSubmittingKasir(true);
    try {
      const cartItems = Object.values(cart);
      const subtotal  = cartItems.reduce((acc, d) => acc + parseFloat(d.item.sellPrice) * d.qty, 0);
      const taxAmount = Math.floor(subtotal * (TAX_PERCENT / 100));
      const total     = subtotal + taxAmount;

      const today   = new Date();
      const pad     = (n) => String(n).padStart(2, '0');
      const dqodate = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
      const ctime   = `${pad(today.getHours())}:${pad(today.getMinutes())}:${pad(today.getSeconds())}`;

      // Field sesuai dokumentasi BQO (Header + BITMQO)
      const lineItemsInfo = cartItems.map((d, idx) => {
        const nhrgjua = parseFloat(d.item?.nhrgjua || d.item?.sellPrice || 0);
        const nqqo    = parseInt(d.qty || 1);
        const discPct = parseFloat(d.item?.ndisc || 0);
        const nrpdisc = discPct > 0 ? Math.round(nhrgjua * nqqo * discPct / 100) : 0;
        return {
          nline:    idx + 1,
          cstocode: (d.item?.cstocode || d.item?.id || '').trim(),
          cstoname: (d.item?.cstoname || d.item?.name || '').trim(),
          csize:    '-',
          nqqo,
          cuom:     (d.item?.csatuan || d.item?.cuom || 'PCS').trim(),
          nhrgjua,
          ndisc:    discPct,
          nrpdisc,
          cremark:  d.note || '',
        };
      });

      const payload = {
        headerInfo: {
          dqodate,
          ctime,
          ctabid:   info.seatNumber  || '',   // Nomor Meja
          cremark:  info.orderByName || '',   // Nama pemesan
          cnotelp:  info.phoneNumber || '',   // No telepon
          npctdisc: 0,
          npctppn:  TAX_PERCENT,
          namount:  subtotal,                  // Total sebelum pajak
          cbnkid:   '',                        // Kosong = bayar di kasir
          cpaytype: '',                        // Kosong = Cash
        },
        lineItemsInfo,
        paymentInfo: { cbnkid: '', namount: 0 }, // belum dibayar
      };

      const result = await bqo_api.add(payload);
      if (result.result === true) {
        const bon = result.onsuccess?.cordernum || result.onsuccess?.csonum || '';
        setKasirResult({ nomorBon: bon, cartItems, subtotal, taxAmount, total });
      } else {
        const errMsg = result.onfail?.cerror || 'Gagal mengirim pesanan.';
        ToastBar('error', `Gagal: ${errMsg}`, 5000);
      }
    } catch (_) {
      ToastBar('error', 'Server tidak bisa dijangkau. Coba lagi.', 5000);
    } finally {
      setIsSubmittingKasir(false);
    }
  };

  const handleNewOrderAfterKasir = () => {
    setKasirResult(null);
    window.localStorage.removeItem('QoCart');
    window.localStorage.removeItem('QoOrderInfo');
    navigate('/menu');
  };

  // Bayar mandiri — lanjut ke halaman payment
  const handlePaySelf = () => {
    setShowPaymentMethodDlg(false);
    window.localStorage.setItem('QoOrderInfo', JSON.stringify(info));
    navigate('/payment');
  };

  return (
    <>
      <div style={styles.container}>
        {/* App Bar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <Grid container justifyContent="space-between">
              <Grid item xs={2}>
                <IconButton
                  sx={styles.appBarIcon}
                  onClick={() => {
                    navigate('/menu');
                  }}
                >
                  <BackIcon />
                </IconButton>
              </Grid>
              <Grid item xs={10}>
                <Typography variant="h6" component="h1" color="black" pt={0.5}>
                  Checkout
                </Typography>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        {/* Item Order */}
        <Container
          maxWidth="sm"
          sx={{ mt: 4, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}
        >
          <Grid container py={2} justifyContent="space-between">
            <Grid item>
              <Typography variant="body1" fontWeight={500} component="h2">
                Item Pesanan
              </Typography>
            </Grid>
            <Grid item>
              <Button sx={{ p: 0 }} onClick={() => navigate('/menu')}>
                Tambah Item
              </Button>
            </Grid>
          </Grid>
          {Object.values(cart).map((data) => (
            <Grid
              key={data.item.id + '_chkout'}
              container
              sx={{ px: 1, py: 3, borderTop: '1px solid #ddd' }}
              justifyContent="flex-start"
              spacing={1}
            >
              <Grid item>
                <img src={Placeholder} style={styles.imageList} alt="Foods & Drinks" />
              </Grid>
              <Grid item xs={7}>
                <Typography variant="body1" component="h2">
                  {data.item.name}
                </Typography>
                {data.note && (
                  <Typography variant="caption" component="h3" color="#a7a7a7">
                    Catatan: {data.note}
                  </Typography>
                )}
                {parseFloat(data.item.sellPrice) < parseFloat(data.item.price) && (
                  <Typography
                    variant={smUp ? 'body1' : 'body2'}
                    fontWeight={500}
                    component="span"
                    color="#787878"
                    mr={0.6}
                    sx={{ textDecoration: 'line-through' }}
                  >
                    Rp {toCurrencyIDR(parseFloat(data.item.price) * parseFloat(data.qty))}
                  </Typography>
                )}
                <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500} component="span">
                  Rp {toCurrencyIDR(parseFloat(data.item.sellPrice) * parseFloat(data.qty))}
                </Typography>
              </Grid>
              <Grid container item xs={12} justifyContent="flex-end" mb={1}>
                <Button
                  variant="outlined"
                  color="error"
                  sx={styles.trashButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(data.item.id);
                  }}
                >
                  <TrashIcon />
                </Button>
                <Button
                  variant="contained"
                  color={isNoteExist(data.item.id) ? 'success' : 'primary'}
                  sx={styles.noteButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenNoteForm(data.item.id);
                  }}
                >
                  {isNoteExist(data.item.id) ? <EditIcon /> : <NoteIcon />}
                </Button>
                <TextField
                  onChange={(event) => changeQtyItem(event, data.item)}
                  onClick={(event) => selectedQtyItem(event)}
                  value={cart[data.item.id].qty}
                  variant="outlined"
                  color="primary"
                  sx={styles.qtyInput}
                  InputProps={{
                    startAdornment: (
                      <IconButton
                        sx={styles.adornIcon}
                        onClick={(event) => decreaseQtyItem(event, data.item)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    ),
                    endAdornment: (
                      <IconButton
                        sx={styles.adornIcon}
                        onClick={(event) => increaseQtyItem(event, data.item)}
                      >
                        <AddIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          ))}
        </Container>
        {/* Info Order */}
        <Container
          maxWidth="sm"
          sx={{ mt: 1, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}
        >
          <Typography variant="body1" fontWeight={500} component="h2" py={2}>
            Informasi Pemesan
          </Typography>
          <Grid container spacing={1} px={1} pb={3} borderTop="1px solid #ddd">
            <Grid item xs={12}>
              <TextField
                size="small"
                variant="standard"
                label="No. Meja"
                name="seatNumber"
                value={info.seatNumber}
                onChange={handleChangeInfo}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                variant="standard"
                label="Nama Pemesan"
                fullWidth
                name="orderByName"
                value={info.orderByName}
                onChange={handleChangeInfo}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                variant="standard"
                label="No. Telp"
                name="phoneNumber"
                value={info.phoneNumber}
                onChange={handleChangeInfo}
              />
            </Grid>
          </Grid>
        </Container>
        {/* Total Order */}
        <Container
          maxWidth="sm"
          sx={{ mt: 1, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}
        >
          <Typography variant="body1" fontWeight={500} component="h2" py={2}>
            Ringkasan Pesanan
          </Typography>
          <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
            <Grid item>
              <Typography variant="body2" component="h2" py={2}>
                Total Belanja
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" fontWeight={500} component="h2" py={2}>
                Rp {toCurrencyIDR(calculatePriceItem())}
              </Typography>
            </Grid>
          </Grid>
          <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
            <Grid item>
              <Typography variant="body2" component="h2" py={2}>
                Pajak
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" fontWeight={500} component="h2" py={2}>
                Rp {toCurrencyIDR(calculateTaxItem())}
              </Typography>
            </Grid>
          </Grid>
          <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
            <Grid item>
              <Typography variant="body1" fontWeight={500} component="h2" py={2}>
                Total Pembayaran
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" fontWeight={500} component="h2" color="green" py={2}>
                Rp {toCurrencyIDR(calculatePriceItem() + calculateTaxItem())}
              </Typography>
            </Grid>
          </Grid>
        </Container>
        {/* Submit Button */}
        <Container
          maxWidth="sm"
          sx={{
            mt: 1,
            p: 2,
            bgcolor: '#fff',
            boxShadow: '0px 0px 4px -2px #000',
            textAlign: 'center',
          }}
        >
          <Button
            variant="contained"
            onClick={handleOnCheckout}
            disabled={isSubmittingKasir}
          >
            {isSubmittingKasir ? 'Mengirim...' : 'Lanjutkan Pesanan'}
          </Button>
        </Container>
        {/* Copyright */}
        <Container sx={{ mt: 4 }}>
          <Typography color="#b7b7b7" variant="body1" component="h4" textAlign="center">
            Powered By <b style={{ color: '#3f50b5' }}>CSA Computer</b>
          </Typography>
        </Container>
      </div>
      {/* Note Form */}
      <Dialog
        maxWidth="md"
        key="NoteFormDlg"
        open={showDialog.isShow && showDialog.isForm}
        onClose={handleCloseDialog}
      >
        {showDialog.isShow && (
          <>
            <DialogContent>
              <Typography variant="h6" component="h2" textAlign="center">
                Catatan
              </Typography>
              <TextField
                sx={styles.noteForm}
                multiline
                value={noteValue}
                onChange={handleChangeNoteValue}
                rows={4}
                variant="filled"
              />
            </DialogContent>
            <DialogActions>
              <Button mr={2} variant="contained" onClick={handleSaveNoteForm} size="small">
                Konfirmasi
              </Button>
              <Button variant="contained" color="error" onClick={handleCloseNoteForm} size="small">
                Batal
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog Pilihan Pembayaran: Kasir vs Mandiri */}
      <Dialog
        key="PaymentMethodDlg"
        open={showPaymentMethodDlg}
        onClose={() => setShowPaymentMethodDlg(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <Typography variant="h6" fontWeight={700}>
            Pilih Cara Pembayaran
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Bayar sekarang atau nanti di kasir?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {/* Pilihan 1: Bayar di Kasir */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handlePayAtKasir}
            sx={{
              py: 2,
              mb: 1.5,
              borderRadius: 2,
              borderWidth: 2,
              justifyContent: 'flex-start',
              gap: 2,
              textTransform: 'none',
              '&:hover': { borderWidth: 2, bgcolor: '#f0f4ff' },
            }}
          >
            <CashierIcon sx={{ fontSize: 32, color: '#3f50b5' }} />
            <div style={{ textAlign: 'left' }}>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                Bayar di Kasir
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pesanan langsung dikirim ke dapur.{'\n'}
                Bayar saat mengambil atau di meja kasir.
              </Typography>
            </div>
          </Button>

          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary">atau</Typography>
          </Divider>

          {/* Pilihan 2: Bayar Mandiri */}
          <Button
            fullWidth
            variant="outlined"
            color="success"
            onClick={handlePaySelf}
            sx={{
              py: 2,
              mt: 1.5,
              borderRadius: 2,
              borderWidth: 2,
              justifyContent: 'flex-start',
              gap: 2,
              textTransform: 'none',
              '&:hover': { borderWidth: 2, bgcolor: '#f0fff4' },
            }}
          >
            <SelfPayIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
            <div style={{ textAlign: 'left' }}>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                Bayar Sendiri (Mandiri)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bayar sekarang lewat QRIS, transfer,{'\n'}
                atau metode digital lainnya.
              </Typography>
            </div>
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowPaymentMethodDlg(false)}
          >
            Batal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden order slip component untuk kasir — rendered tapi tidak terlihat */}
      {kasirResult && (
        <div style={{ display: 'none' }}>
          <BQOOrderSlip
            ref={printComponentRef}
            datas={{
              orderInfo:    info,
              cart:         kasirResult.cartItems,
              subtotal:     kasirResult.subtotal,
              taxAmount:    kasirResult.taxAmount,
              total:        kasirResult.total,
              nomorPesanan: kasirResult.nomorBon,
            }}
          />
        </div>
      )}

      {/* Dialog Konfirmasi Pesanan Kasir + Struk */}
      <Dialog
        key="KasirConfirmDlg"
        open={!!kasirResult}
        onClose={() => {}}   // tidak bisa ditutup tanpa aksi — harus cetak atau skip
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 0.5 }} />
          <Typography variant="h6" fontWeight={700} display="block">
            Pesanan Diterima!
          </Typography>
          {kasirResult?.nomorBon && (
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              No. Pesanan: <b>{kasirResult.nomorBon}</b>
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, pb: 0 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Tunjukkan struk ini ke kasir saat pembayaran.
          </Typography>
          <Divider sx={{ mt: 1.5, mb: 0.5 }} />
          {/* Ringkasan item */}
          {kasirResult?.cartItems?.map((d, i) => (
            <Grid key={i} container justifyContent="space-between" py={0.3}>
              <Grid item xs={8}>
                <Typography variant="caption">
                  {d.qty}× {d.item.name}
                  {d.note ? <span style={{ color: '#999' }}> ({d.note})</span> : ''}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="caption">
                  Rp {toCurrencyIDR(parseFloat(d.item.sellPrice) * d.qty)}
                </Typography>
              </Grid>
            </Grid>
          ))}
          <Divider sx={{ mt: 0.5, mb: 0.5 }} />
          <Grid container justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">Subtotal</Typography>
            <Typography variant="caption">Rp {toCurrencyIDR(kasirResult?.subtotal || 0)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">Pajak (11%)</Typography>
            <Typography variant="caption">Rp {toCurrencyIDR(kasirResult?.taxAmount || 0)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between" mt={0.3}>
            <Typography variant="body2" fontWeight={700}>Total</Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              Rp {toCurrencyIDR(kasirResult?.total || 0)}
            </Typography>
          </Grid>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            mt={1}
            sx={{ fontStyle: 'italic' }}
          >
            Meja: {info.seatNumber} · {info.orderByName}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 1.5, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            color={printCount > 0 ? 'success' : 'primary'}
          >
            {printCount > 0 ? `Cetak Ulang (${printCount}×)` : 'Cetak Tanda Pesanan'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleNewOrderAfterKasir}
          >
            Pesanan Baru
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
