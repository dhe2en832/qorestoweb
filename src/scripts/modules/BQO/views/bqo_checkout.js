import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NoteIcon from '@mui/icons-material/NoteAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TrashIcon from '@mui/icons-material/DeleteOutline';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import Placeholder from '../../../../images/placeholder.png';
import useResponsive from '../../../hooks/useResponsive';
import { toCurrencyIDR } from '../../../utils/formatter'

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
                textAlign: 'center'
            }
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
            }
        },
    }

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
        })
    }
    const handleOpenDialog = (isForm, accessorID) => {
        setShowDialog({
            isShow: true,
            isForm,
            accessorID,
        })
    }

    // Info Order
    const [info, setInfo] = useState({
        seatNumber: "",
        orderByName: "",
        phoneNumber: "",
    })

    const handleChangeInfo = (event) => {
        setInfo({
            ...info,
            [event.target.name]: event.target.value,
        })
    }

    // Cart
    const [cart, setCart] = useState(JSON.parse(window.localStorage.getItem('QoCart')) || {});
    const removeItem = (id) => {
        delete cart[id];
        setCart({ ...cart });
    }
    const increaseQtyItem = (event, data) => {
        event.stopPropagation();
        setCart({
            ...cart,
            [data.id]: {
                item: data,
                qty: cart[data.id].qty + 1,
                ...(cart[data.id].note && { note: cart[data.id].note })
            }
        })
    }
    const decreaseQtyItem = (event, data) => {
        event.stopPropagation();
        const qtyItem = cart[data.id].qty
        setCart({
            ...cart,
            [data.id]: {
                item: data,
                qty: qtyItem === 1 ? 1 : qtyItem - 1,
                ...(cart[data.id].note && { note: cart[data.id].note })
            }
        });
    }
    // const calculateQtyItem = () => {
    //     let totalQty = 0
    //     Object.values(cart).forEach((data) => totalQty = totalQty + data.qty);
    //     return totalQty;
    // }
    const calculatePriceItem = () => {
        let totalPrice = 0
        Object.values(cart).forEach((data) => totalPrice = totalPrice + (parseFloat(data.item.sellPrice) * data.qty));
        return totalPrice;
    }
    const calculateTaxItem = () => {
        return Math.floor(parseFloat(calculatePriceItem() * (10 / 100)));
    }
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
                    qty: newValue === "" ? 1 : parseInt(newValue),
                    ...(cart[data.id].note && { note: cart[data.id].note })
                }
            })
        }
    }
    const selectedQtyItem = (event) => {
        event.stopPropagation();
        event.target.select();
    }
    useEffect(() => {
        window.localStorage.setItem('QoCart', JSON.stringify(cart))
        Object.entries(cart).length === 0 && navigate("/bqo")
    }, [cart, navigate]);

    // Note Form
    const [noteValue, setNoteValue] = useState("");
    const isNoteExist = (id) => {
        const dataCheck = cart[id].note;
        return dataCheck ? true : false;
    }
    const handleChangeNoteValue = (event) => {
        setNoteValue(event.target.value);
    }
    const handleOpenNoteForm = (accessorID) => {
        isNoteExist(accessorID) && setNoteValue(cart[accessorID].note);
        handleOpenDialog(true, accessorID);
    }
    const handleCloseNoteForm = () => {
        setNoteValue('');
        handleCloseDialog()
    }
    const handleSaveNoteForm = () => {
        if (noteValue !== "") {
            setCart({
                ...cart,
                [showDialog.accessorID]: {
                    item: cart[showDialog.accessorID].item,
                    qty: cart[showDialog.accessorID].qty,
                    note: noteValue,
                }
            });
        } else {
            setCart({
                ...cart,
                [showDialog.accessorID]: {
                    item: cart[showDialog.accessorID].item,
                    qty: cart[showDialog.accessorID].qty,
                }
            });
        }
        handleCloseNoteForm()
    };

    return (
        <>
            <div style={styles.container}>
                {/* App Bar */}
                <AppBar position="fixed" sx={styles.appBar}>
                    <Toolbar>
                        <Grid container justifyContent="space-between">
                            <Grid item xs={2}>
                                <IconButton sx={styles.appBarIcon} onClick={() => { navigate("/bqo") }}>
                                    <BackIcon />
                                </IconButton>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography variant="h6" component="h1" color="black" pt={0.5}>Checkout</Typography>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                {/* Info Order */}
                <Container maxWidth="sm" sx={{ mt: 4, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}>
                    <Typography variant="body1" fontWeight={500} component="h2" py={2}>Informasi Pemesan</Typography>
                    <Grid container spacing={1} px={1} pt={1} pb={3} borderTop="1px solid #ddd">
                        <Grid item>
                            <TextField size='small' variant="filled" label="No. Meja" name="seatNumber" value={info.seatNumber} onChange={handleChangeInfo} />
                        </Grid>
                        <Grid item>
                            <TextField size='small' variant="filled" label="Nama Pemesan" name="orderByName" value={info.orderByName} onChange={handleChangeInfo} />
                        </Grid>
                        <Grid item>
                            <TextField size='small' variant="filled" label="No. Telp" name="phoneNumber" value={info.phoneNumber} onChange={handleChangeInfo} />
                        </Grid>
                    </Grid>
                </Container>
                {/* Item Order */}
                <Container maxWidth="sm" sx={{ mt: 1, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}>
                    <Grid container py={2} justifyContent="space-between">
                        <Grid item>
                            <Typography variant="body1" fontWeight={500} component="h2">Item Pesanan</Typography>
                        </Grid>
                        <Grid item>
                            <Button sx={{ p: 0 }} onClick={() => navigate("/bqo")}>Tambah Item</Button>
                        </Grid>
                    </Grid>
                    {
                        Object.values(cart).map((data) => (
                            <Grid key={data.item.id + "_chkout"} container sx={{ px: 1, py: 3, borderTop: '1px solid #ddd' }} justifyContent='flex-start' spacing={1}>
                                <Grid item>
                                    <img src={Placeholder} style={styles.imageList} alt="Foods & Drinks" />
                                </Grid>
                                <Grid item xs={7}>
                                    <Typography variant='body1' component='h2'>{data.item.name}</Typography>
                                    {data.note && (<Typography variant='caption' component='h3' color="#a7a7a7">Catatan: {data.note}</Typography>)}
                                    {parseFloat(data.item.sellPrice) < parseFloat(data.item.price) && (
                                        <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500} component='span' color="#787878" mr={0.6} sx={{ textDecoration: 'line-through' }}>Rp {toCurrencyIDR(parseFloat(data.item.price) * parseFloat(data.qty))}</Typography>
                                    )}
                                    <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500} component='span'>Rp {toCurrencyIDR(parseFloat(data.item.sellPrice) * parseFloat(data.qty))}</Typography>
                                </Grid>
                                <Grid container item xs={12} justifyContent='flex-end' mb={1}>
                                    <Button variant="outlined" color='error' sx={styles.trashButton}
                                        onClick={
                                            (event) => {
                                                event.stopPropagation();
                                                removeItem(data.item.id)
                                            }
                                        }
                                    >
                                        <TrashIcon />
                                    </Button>
                                    <Button variant='contained' color={isNoteExist(data.item.id) ? 'success' : 'primary'} sx={styles.noteButton}
                                        onClick={
                                            (event) => {
                                                event.stopPropagation();
                                                handleOpenNoteForm(data.item.id)
                                            }
                                        }
                                    >
                                        {isNoteExist(data.item.id) ? <EditIcon /> : <NoteIcon />}
                                    </Button>
                                    <TextField onChange={(event) => changeQtyItem(event, data.item)} onClick={(event) => selectedQtyItem(event)} value={cart[data.item.id].qty} variant="outlined" color="primary" sx={styles.qtyInput} InputProps={{
                                        startAdornment: (
                                            <IconButton sx={styles.adornIcon} onClick={(event) => decreaseQtyItem(event, data.item)}>
                                                <RemoveIcon />
                                            </IconButton>
                                        ),
                                        endAdornment: (
                                            <IconButton sx={styles.adornIcon} onClick={(event) => increaseQtyItem(event, data.item)}>
                                                <AddIcon />
                                            </IconButton>
                                        )
                                    }} />
                                </Grid>
                            </Grid>
                        ))
                    }
                </Container >
                {/* Total Order */}
                <Container maxWidth="sm" sx={{ mt: 1, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000' }}>
                    <Typography variant="body1" fontWeight={500} component="h2" py={2}>Ringkasan Pesanan</Typography>
                    <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
                        <Grid item>
                            <Typography variant="body2" component="h2" py={2}>Total Belanja</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" fontWeight={500} component="h2" py={2}>Rp {toCurrencyIDR(calculatePriceItem())}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
                        <Grid item>
                            <Typography variant="body2" component="h2" py={2}>Pajak</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" fontWeight={500} component="h2" py={2}>Rp {toCurrencyIDR(calculateTaxItem())}</Typography>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="space-between" borderTop="1px solid #ddd">
                        <Grid item>
                            <Typography variant="body1" fontWeight={500} component="h2" py={2}>Total Pembayaran</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body2" fontWeight={500} component="h2" color="green" py={2}>Rp {toCurrencyIDR((calculatePriceItem() + calculateTaxItem()))}</Typography>
                        </Grid>
                    </Grid>
                </Container>
                {/* Submit Button */}
                <Container maxWidth="sm" sx={{ mt: 1, p: 2, bgcolor: '#fff', boxShadow: '0px 0px 4px -2px #000', textAlign: 'center' }}>
                    <Button variant="contained" onClick={() => {
                        alert("Cek console pada browser untuk informasi pesanan.\n(Mode = Development)")
                        console.log(JSON.stringify({ info, cart }, null, 2))
                    }}>
                        Lanjutkan Pesanan
                    </Button>
                </Container>
                {/* Copyright */}
                <Container sx={{ mt: 4 }}>
                    <Typography color="#b7b7b7" variant="body1" component="h4" textAlign="center">
                        Powered By <b style={{ color: '#3f50b5' }}>CSA Computer</b>
                    </Typography>
                </Container>
            </div >
            {/* Note Form */}
            <Dialog maxWidth="md" key="NoteFormDlg" open={showDialog.isShow && showDialog.isForm} onClose={handleCloseDialog}>
                {showDialog.isShow && (
                    <>
                        <DialogContent>
                            <Typography variant="h6" component="h2" textAlign="center">Catatan</Typography>
                            <TextField sx={styles.noteForm} multiline value={noteValue} onChange={handleChangeNoteValue} rows={4} variant="filled" />
                        </DialogContent>
                        <DialogActions>
                            <Button mr={2} variant="contained" onClick={handleSaveNoteForm} size="small">Konfirmasi</Button>
                            <Button variant="contained" color="error" onClick={handleCloseNoteForm} size="small">
                                Batal
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    )
}
