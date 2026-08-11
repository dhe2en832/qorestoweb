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
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { getTableId, initTableId } from '../../../utils/table-session';
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
import Config from '../../../Config';

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
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * getDatas — ambil menu dari bstock_x.
   * Mode dikontrol via Config.USE_BRWDEF (true/false di Config.js):
   *   true  → usebrwdef:true, response array of arrays
   *   false → usebrwdef:false, response array of objects (cfamcode tersedia)
   *   REACT_APP_MENU_GETIMAGE=Y → request gambar dari server
   */
  async function getDatas(overrides = {}) {
    const useBrwDef = Config.USE_BRWDEF;
    const res = await bqo_api.getList(overrides);
    if (!res || !res.result || !res.data) return null;

    let datas;

    if (useBrwDef && res.columns && Array.isArray(res.data) && Array.isArray(res.data[0])) {
      // ── Format brwdef: data berupa array of arrays, columns berupa array of {key,title,...} ──
      const cols = res.columns; // [{key,title,...}, ...]
      const findIdx = (...kw) =>
        cols.findIndex((c) =>
          kw.some((k) => (c.title || c.key || '').toLowerCase().includes(k.toLowerCase()))
        );

      const idxName  = findIdx('nama item', 'cstoname');
      const idxSat   = findIdx('sat', 'csatuan');
      const idxHarga = findIdx('harga jual', 'nhrgjua');
      const idxKode  = findIdx('kode item', 'cstocode');
      const idxFam   = findIdx('cfamcode', 'famcode', 'kategori');
      const idxDisc  = findIdx('ndisc', 'diskon', 'disc');
      const idxNotes = findIdx('cnotes1', 'notes1', 'keterangan');
      const idxImg   = findIdx('cimageurl', 'picture', 'image');

      const parseNum = (v) => parseFloat(String(v || '').replace(/,/g, '')) || 0;

      datas = res.data.map((row) => {
        const cstocode = String(row[idxKode  >= 0 ? idxKode  : 0] || '').trim();
        const cstoname = String(row[idxName  >= 0 ? idxName  : 1] || '').trim();
        const nhrgjua  = parseNum(row[idxHarga >= 0 ? idxHarga : 4]);
        const csatuan  = String(row[idxSat   >= 0 ? idxSat   : 3] || 'PCS').trim();
        const ndisc    = parseNum(row[idxDisc  >= 0 ? idxDisc  : -1]);
        const desc     = idxNotes >= 0 ? String(row[idxNotes] || '').trim() : '';
        const picture  = idxImg   >= 0 ? (String(row[idxImg]  || '').trim() || null) : null;

        // Kategori: ambil dari cfamcode jika kolom tersedia, fallback ke prefix kode item
        let category = 'UMUM';
        if (idxFam >= 0 && row[idxFam]) {
          category = String(row[idxFam]).trim();
        } else {
          const prefix = cstocode.match(/^([A-Z]+)-/);
          category = prefix ? prefix[1] : 'UMUM';
        }

        return {
          id:        cstocode,
          name:      cstoname,
          desc,
          price:     String(nhrgjua),
          sellPrice: String(nhrgjua),
          category,
          picture,
          cstocode,
          cstoname,
          nhrgjua,
          csatuan,
          ndisc,
        };
      });
    } else {
      // ── Format non-brwdef: data berupa array of objects dengan cfamcode ──
      datas = res.data.map((item) => ({
        id:        (item.cstocode || '').trim(),
        name:      (item.cstoname || '').trim(),
        desc:      (item.cstoname2 || item.cnotes1 || '').trim(),
        price:     String(parseFloat(item.nhrgjua || 0)),
        sellPrice: String(parseFloat(item.nhrgjua || 0)),
        category:  (item.cfamcode || 'UMUM').trim(),
        picture:   item.cimageurl || item.picture || null,
        cstocode:  (item.cstocode || '').trim(),
        cstoname:  (item.cstoname || '').trim(),
        nhrgjua:   parseFloat(item.nhrgjua || 0),
        csatuan:   (item.csatuan || 'PCS').trim(),
        ndisc:     parseFloat(item.ndisc || 0),
      }));
    }

    // Bangun daftar kategori dari data yang ada
    const catMap = {};
    catMap['all']    = { id: 'all',    label: 'Semua' };
    catMap['promos'] = { id: 'promos', label: '🏷️ Promo' };
    datas.forEach((item) => {
      const key = item.category;
      if (key && key !== '-' && !catMap[key]) catMap[key] = { id: key, label: key };
    });
    const categories = Object.values(catMap);

    return { datas, categories };
  }

  useEffect(() => {
    // Re-init table ID dari URL setiap kali halaman menu dimount
    // (handle kasus: customer sudah login, lalu scan QR meja baru)
    initTableId();

    let isActive = true;
    async function setDataToList() {
      setIsLoading(true);
      const resJson = await getDatas();
      if (!isActive) return;
      if (resJson && resJson.datas) {
        setLists(resJson.datas);
        setCategories(resJson.categories ?? []);
      }
      setIsLoading(false);
    }
    isActive && setDataToList();
    return () => (isActive = false);
  }, []);

  // List -> Category
  const [tabValue, setTabValue] = useState('all');
  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue);
    setIsLoading(true);
    const resJson = await getDatas();
    setIsLoading(false);
    if (!resJson || !resJson.datas) return;
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
    const keyword = (event.target.value || '').trim();
    setIsLoading(true);
    const resJson = await getDatas({ query: { freefilter: { search: '!LDISCONT' }, textfilter: { search: keyword } } });
    setIsLoading(false);
    if (!resJson || !resJson.datas) return;
    // Fallback filter client-side jika backend tidak support textfilter
    const datasFilter = keyword
      ? resJson.datas.filter((data) => data.name.toLowerCase().includes(keyword.toLowerCase()))
      : resJson.datas;
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
            <Grid container justifyContent="space-between" alignItems="center">
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
              <Grid item xs={getTableId() ? 7 : 11}>
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
              {getTableId() && (
                <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 1 }}>
                  <TableRestaurantIcon sx={{ color: '#3f50b5', fontSize: 18, mr: 0.5 }} />
                  <Typography variant="body2" fontWeight={600} color="#3f50b5" noWrap>
                    Meja {getTableId()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Toolbar>
          {/* Progress bar muncul di bawah toolbar saat fetch */}
          {isLoading && (
            <LinearProgress
              sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 }}
            />
          )}
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
          {isLoading ? (
            /* Skeleton cards saat fetch data */
            Array.from({ length: 4 }).map((_, i) => (
              <Paper key={`skel_${i}`} sx={{ my: 2 }}>
                <Grid container sx={{ px: 1, py: 0.2 }} justifyContent="flex-start" spacing={1}>
                  <Grid item>
                    <Skeleton variant="rectangular" width={smUp ? 85 : 75} height={smUp ? 85 : 75} sx={{ borderRadius: 1 }} />
                  </Grid>
                  <Grid item xs={7}>
                    <Skeleton variant="text" width="70%" height={28} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="30%" height={24} />
                  </Grid>
                  <Grid container item xs={12} justifyContent="flex-end" mb={1}>
                    <Skeleton variant="rounded" width={88} height={36} />
                  </Grid>
                </Grid>
              </Paper>
            ))
          ) : lists.length !== 0 ? (
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
                    <img
                      src={data.picture || Placeholder}
                      style={styles.imageList}
                      alt={data.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = Placeholder; }}
                    />
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
                Maaf, Menu Ini Belum Tersedia.
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
                  src={data.picture || Placeholder}
                  alt={data.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = Placeholder; }}
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
