import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import NoteIcon from '@mui/icons-material/NoteAltOutlined';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BackIcon from '@mui/icons-material/ArrowBackIos';
import ForwardIcon from '@mui/icons-material/ArrowForwardIos';
import CartIcon from '@mui/icons-material/ShoppingCart';
import CartLessIcon from '@mui/icons-material/ShoppingCartOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Placeholder from '../../../../images/placeholder.png';
import useResponsive from '../../../hooks/useResponsive';
import { toCurrencyIDR } from '../../../utils/formatter';
import bqo_api from '../controllers/bqo_api';

export default function BQOHome() {
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
    search: {
      '& .MuiInputBase-input': {
        marginLeft: 2,
      },
      fontSize: '0.95rem',
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

  // List
  const [lists, setLists] = useState([]);
  // List
  const [categories, setCategories] = useState([]);

  async function getDatas() {
    return await bqo_api.getList({});
  }

  useEffect(() => {
    let isActive = true;
    async function setDataToList() {
      const resJson = await getDatas();
      setLists(resJson.datas);
      setCategories(resJson.categories);
    }
    isActive && setDataToList();
    return () => (isActive = false);
  }, []);

  // List -> Category
  const [tabValue, setTabValue] = useState('all');
  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue);
    const resJson = await getDatas();
    let datasFilter;
    switch (newValue) {
      case 'all':
        setLists(resJson.datas);
        break;
      case 'promos':
        datasFilter = resJson.datas.filter((data) => data.price !== data.sellPrice);
        setLists(datasFilter);
        break;
      default:
        datasFilter = resJson.datas.filter((data) => data.category === newValue);
        setLists(datasFilter);
        break;
    }
  };

  // List - Search
  const handleChangeSearch = async (event) => {
    const resJson = await getDatas();
    const datasFilter = resJson.datas.filter((data) => data.name.includes(event.target.value));
    setLists(datasFilter);
    setTabValue('none');
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
  const searchInfoDialog = (accessorID) => {
    const dataFilter = lists.filter((data) => data.id === accessorID);
    return dataFilter;
  };

  // Cart
  const [cart, setCart] = useState(JSON.parse(window.localStorage.getItem('QoCart')) || {});
  const isExistItem = (id) => {
    const dataCheck = cart[id];
    return dataCheck ? true : false;
  };
  const addItem = (event, data) => {
    event.stopPropagation();
    setCart({
      ...cart,
      [data.id]: {
        item: data,
        qty: 1,
      },
    });
  };
  const handleAddItemDlg = (event, data) => {
    addItem(event, data);
    handleCloseDialog();
  };
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
    if (cart[data.id].qty === 1) {
      removeItem(data.id);
    } else {
      setCart({
        ...cart,
        [data.id]: {
          item: data,
          qty: cart[data.id].qty - 1,
          ...(cart[data.id].note && { note: cart[data.id].note }),
        },
      });
    }
  };
  const calculateQtyItem = () => {
    let totalQty = 0;
    Object.values(cart).forEach((data) => (totalQty = totalQty + data.qty));
    return totalQty;
  };
  const calculatePriceItem = () => {
    let totalPrice = 0;
    Object.values(cart).forEach(
      (data) => (totalPrice = totalPrice + parseFloat(data.item.sellPrice) * data.qty)
    );
    return totalPrice;
  };
  const changeQtyItem = (event, data) => {
    event.stopPropagation();
    const newValue = event.target.value;
    if (parseInt(newValue) === 0) {
      removeItem(data.id);
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
  }, [cart]);

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

  return (
    <>
      {/* List */}
      <div style={styles.container}>
        {/* List -> Search Bar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <Grid container justifyContent="space-between">
              <Grid item xs={1}>
                <IconButton
                  sx={styles.appBarIcon}
                  onClick={() => {
                    navigate('/');
                  }}
                >
                  <BackIcon />
                </IconButton>
              </Grid>
              <Grid item xs={11}>
                <InputBase
                  onChange={handleChangeSearch}
                  fullWidth={true}
                  sx={styles.search}
                  endAdornment={
                    <IconButton sx={styles.appBarIcon}>
                      <SearchIcon />
                    </IconButton>
                  }
                  type="search"
                  placeholder="Cari Apa?"
                />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        {/* List -> Category */}
        <Container maxWidth="sm" sx={{ mt: 5 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 1 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons={false}
              visibleScrollbar={true}
              aria-label="scrollable-tabs-bqo"
            >
              {categories.map((category) => (
                <Tab
                  key={category.id + '_key'}
                  label={category.label}
                  value={category.id}
                  sx={{ display: category.id === 'none' ? 'none' : 'inline-flex' }}
                />
              ))}
            </Tabs>
          </Box>
        </Container>
        {/* List -> Menu */}
        <Container maxWidth="sm">
          {lists.length !== 0 ? (
            lists.map((data) => (
              <Paper
                key={data.id}
                sx={{
                  my: 2,
                  ':hover': {
                    background: '#00bcd41f',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => handleOpenDialog(false, data.id)}
              >
                <Grid container sx={{ px: 1, py: 0.2 }} justifyContent="flex-start" spacing={1}>
                  <Grid item>
                    <img src={Placeholder} style={styles.imageList} alt="Foods & Drinks" />
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body1" component="h2">
                      {data.name}
                    </Typography>
                    <Typography variant="caption" component="h3" color="#a7a7a7" lineHeight={1}>
                      {data.desc}
                    </Typography>
                    {parseFloat(data.sellPrice) < parseFloat(data.price) && (
                      <Typography
                        variant={smUp ? 'body1' : 'body2'}
                        fontWeight={500}
                        component="span"
                        color="#787878"
                        mr={0.6}
                        sx={{ textDecoration: 'line-through' }}
                      >
                        Rp {toCurrencyIDR(data.price)}
                      </Typography>
                    )}
                    <Typography
                      variant={smUp ? 'body1' : 'body2'}
                      fontWeight={500}
                      component="span"
                    >
                      Rp {toCurrencyIDR(data.sellPrice)}
                    </Typography>
                  </Grid>
                  {isExistItem(data.id) ? (
                    <Grid container item xs={12} justifyContent="flex-end" mb={1}>
                      <Button
                        variant="outlined"
                        color={isNoteExist(data.id) ? 'success' : 'primary'}
                        sx={styles.noteButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenNoteForm(data.id);
                        }}
                      >
                        {isNoteExist(data.id) ? <EditIcon /> : <NoteIcon />}
                      </Button>
                      <TextField
                        onChange={(event) => changeQtyItem(event, data)}
                        onClick={(event) => selectedQtyItem(event)}
                        value={cart[data.id].qty}
                        variant="outlined"
                        color="primary"
                        sx={styles.qtyInput}
                        InputProps={{
                          startAdornment: (
                            <IconButton
                              sx={styles.adornIcon}
                              onClick={(event) => decreaseQtyItem(event, data)}
                            >
                              <RemoveIcon />
                            </IconButton>
                          ),
                          endAdornment: (
                            <IconButton
                              sx={styles.adornIcon}
                              onClick={(event) => increaseQtyItem(event, data)}
                            >
                              <AddIcon />
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                  ) : (
                    <Grid container item xs={12} justifyContent="flex-end" mb={1}>
                      <Button variant="contained" onClick={(event) => addItem(event, data)}>
                        Tambah
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))
          ) : (
            <Paper sx={{ my: 2 }}>
              <Typography p={2} color="#a7a7a7" fontWeight={100} textAlign="center">
                Maaf, Menu Ini Belum Terdaftar.
              </Typography>
            </Paper>
          )}
        </Container>
        {/* List -> Copyright */}
        <Container>
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
      {/* Info */}
      <Dialog
        maxWidth="md"
        key="InfoDlg"
        open={showDialog.isShow && !showDialog.isForm}
        onClose={handleCloseDialog}
      >
        {showDialog.isShow &&
          searchInfoDialog(showDialog.accessorID).map((data) => (
            <div key={data.id + 'dlg'}>
              <DialogContent>
                <img
                  style={{
                    maxHeight: '60vh',
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                  }}
                  src={data.picture}
                  alt={data.name}
                />
                <Typography variant="h6" component="h2">
                  {data.name}
                </Typography>
                <Typography variant="caption" component="h3" color="#a7a7a7">
                  {data.desc}
                </Typography>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Typography
                      variant={smUp ? 'body1' : 'body2'}
                      fontWeight={500}
                      component="span"
                    >
                      Harga
                    </Typography>
                  </Grid>
                  <Grid item>
                    {parseFloat(data.sellPrice) < parseFloat(data.price) && (
                      <Typography
                        variant={smUp ? 'body1' : 'body2'}
                        fontWeight={500}
                        component="span"
                        color="#787878"
                        mr={0.6}
                        sx={{ textDecoration: 'line-through' }}
                      >
                        Rp {toCurrencyIDR(data.price)}
                      </Typography>
                    )}
                    <Typography
                      variant={smUp ? 'body1' : 'body2'}
                      fontWeight={500}
                      component="span"
                    >
                      Rp {toCurrencyIDR(data.sellPrice)}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  mr={2}
                  variant="contained"
                  onClick={(event) => handleAddItemDlg(event, data)}
                  disabled={isExistItem(data.id) ? true : false}
                >
                  {isExistItem(data.id) ? <CartIcon /> : <CartLessIcon />}
                </Button>
                <Button variant="contained" color="error" onClick={handleCloseDialog}>
                  <CloseIcon />
                </Button>
              </DialogActions>
            </div>
          ))}
      </Dialog>
      {/* Cart Calculate */}
      {Object.entries(cart).length !== 0 && (
        <div
          style={{
            boxSizing: 'border-box',
            position: 'relative',
            margin: '0 auto',
            maxWidth: '550px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/checkout')}
        >
          <div
            style={{
              maxWidth: '550px',
              width: '100%',
              position: 'fixed',
              bottom: '0',
              padding: '1rem',
            }}
          >
            <Grid
              container
              spacing={1}
              justifyContent="space-between"
              sx={{
                m: 0,
                p: 2,
                backgroundColor: '#3f50b5',
                width: '100%',
                borderRadius: '5px',
                color: '#fff',
              }}
            >
              <Grid item container xs={11} spacing={1}>
                <Grid item>
                  <CartIcon fontSize="small" />
                </Grid>
                <Grid item>
                  <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500}>
                    {calculateQtyItem()} Item
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500}>
                    :
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant={smUp ? 'body1' : 'body2'} fontWeight={500}>
                    Rp {toCurrencyIDR(calculatePriceItem())}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item container xs={1} justifyContent="flex-end">
                <ForwardIcon fontSize="small" />
              </Grid>
            </Grid>
          </div>
        </div>
      )}
    </>
  );
}
