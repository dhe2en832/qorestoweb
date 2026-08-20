import React, { useState, useEffect, useCallback, memo } from 'react';
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
import { getAppConfig } from '../../../utils/app-config';
import { useAuth } from '../../../contexts/AuthContext';
import { getTableId, initTableId } from '../../../utils/table-session';

// ── Komponen Dialog Catatan — dipisah agar tidak memicu re-render list saat ketik ──
const NoteDialog = memo(function NoteDialog({ open, initialValue, initialValue2, onSave, onClose }) {
  const [value, setValue] = useState(initialValue || '');
  const [value2, setValue2] = useState(initialValue2 || '');

  // Sync nilai awal saat dialog dibuka
  useEffect(() => {
    if (open) {
      setValue(initialValue || '');
      setValue2(initialValue2 || '');
    }
  }, [open, initialValue, initialValue2]);

  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          position: { xs: 'fixed', sm: 'relative' },
          top:      { xs: 16,     sm: 'auto'      },
          m:        { xs: 1,      sm: 'auto'      },
        }
      }}
    >
      <DialogContent>
        <Typography variant="h6" component="h2" textAlign="center" mb={1}>
          Catatan
        </Typography>
        <TextField
          sx={{ '& .MuiInputBase-root': { padding: 1 }, mb: 1.5 }}
          multiline
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          variant="filled"
          label="Catatan 1"
          placeholder="Misal: tidak pedas, tanpa bawang..."
        />
        <TextField
          sx={{ '& .MuiInputBase-root': { padding: 1 } }}
          multiline
          fullWidth
          value={value2}
          onChange={(e) => setValue2(e.target.value)}
          rows={2}
          variant="filled"
          label="Catatan 2"
          placeholder="Catatan tambahan..."
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => onSave(value, value2)} size="small">
          Konfirmasi
        </Button>
        <Button variant="contained" color="error" onClick={onClose} size="small">
          Batal
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default function BQOHome() {
  const { smUp } = useResponsive();
  const navigate = useNavigate();
  const auth = useAuth();
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
  const [debugLog, setDebugLog] = useState([]);

  // Server-side pagination
  const PAGE_SIZE = 30;
  const [totalItems, setTotalItems] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasMore = lists.length < totalItems;

  const handleLoadMore = async () => {
    const nextOffset = currentOffset + PAGE_SIZE;
    setIsLoadingMore(true);
    const resJson = await getDatas({ offset: nextOffset, limit: PAGE_SIZE });
    setIsLoadingMore(false);
    if (resJson && resJson.datas) {
      setLists((prev) => [...prev, ...resJson.datas]);
      setCurrentOffset(nextOffset);
    }
  };

  // Helper: reset list dan pagination
  const resetAndSetLists = (newList, total) => {
    setLists(newList);
    setCurrentOffset(0);
    if (typeof total === 'number') setTotalItems(total);
  };

  const debugEnabled = getAppConfig().debug_screen === true;

  const addDebugLog = (msg, isError = false) => {
    const time = new Date().toLocaleTimeString('id-ID');
    setDebugLog((prev) => [...prev.slice(-19), { time, msg, isError }]);
  };

  /**
   * getDatas — ambil menu dari bstock_x.
   * Mode dikontrol via Config.USE_BRWDEF (true/false di Config.js):
   *   true  → usebrwdef:true, response array of arrays
   *   false → usebrwdef:false, response array of objects (cfamcode tersedia)
   *   REACT_APP_MENU_GETIMAGE=Y → request gambar dari server
   */
  async function getDatas(overrides = {}) {
    const useBrwDef = Config.USE_BRWDEF;
    addDebugLog(`getList start — useBrwDef:${useBrwDef} key:${Config.SESSION_KEY()?.substring(0,8)}...`);
    const res = await bqo_api.getList(overrides);
    if (!res || !res.result || !res.data) {
      addDebugLog(`getList FAIL — result:${res?.result} msg:${res?.onfail?.cerror || JSON.stringify(res)?.substring(0,60)}`, true);
      return null;
    }
    addDebugLog(`getList OK — ${res.data?.length ?? 0} items`);

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
    initTableId();
    addDebugLog(`mount — tableId:${getTableId()} key:${Config.SESSION_KEY()?.substring(0,8) ?? 'null'}...`);
    const loginErr = window.sessionStorage.getItem('qoGuestLoginError');
    if (loginErr) addDebugLog(`LOGIN ERR: ${loginErr}`, true);

    let isActive = true;

    async function loadMenu() {
      setIsLoading(true);

      // 1. Ambil total count dulu
      let totalRes = await bqo_api.getListTotal();
      if (!totalRes?.result && getTableId()) {
        addDebugLog('getTotal gagal, coba re-login...', true);
        await new Promise((resolve) => auth.signinAsGuest(resolve));
        addDebugLog(`re-login selesai, key:${Config.SESSION_KEY()?.substring(0,8) ?? 'null'}...`);
        totalRes = await bqo_api.getListTotal();
      }
      const total = totalRes?.metadata?.total || 0;
      if (isActive) setTotalItems(total);
      addDebugLog(`total items: ${total}`);

      // 2. Ambil halaman pertama
      let resJson = await getDatas({ offset: 0, limit: PAGE_SIZE });
      if (!resJson && getTableId()) {
        await new Promise((resolve) => auth.signinAsGuest(resolve));
        resJson = await getDatas({ offset: 0, limit: PAGE_SIZE });
      }

      if (!isActive) return;
      if (resJson && resJson.datas) {
        resetAndSetLists(resJson.datas, total);
        setCategories(resJson.categories ?? []);
        addDebugLog(`page 1 loaded: ${resJson.datas.length} items`);
      } else {
        addDebugLog('lists empty or null', true);
      }
      setIsLoading(false);
    }

    isActive && loadMenu();
    return () => (isActive = false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // List -> Category — fetch semua untuk filter client-side (kategori hanya subset)
  const [tabValue, setTabValue] = useState('all');
  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 'all') {
      // Reset ke server pagination
      setIsLoading(true);
      const resJson = await getDatas({ offset: 0, limit: PAGE_SIZE });
      setIsLoading(false);
      if (!resJson || !resJson.datas) return;
      const totalRes = await bqo_api.getListTotal();
      const total = totalRes?.metadata?.total || 0;
      resetAndSetLists(resJson.datas, total);
      return;
    }
    // Untuk filter kategori/promo — fetch semua dulu (tanpa limit), filter client-side
    setIsLoading(true);
    const resJson = await getDatas({ offset: 0, limit: 9999 });
    setIsLoading(false);
    if (!resJson || !resJson.datas) return;
    let datasFilter;
    switch (newValue) {
      case 'promos':
        datasFilter = resJson.datas.filter((data) => data.price !== data.sellPrice);
        break;
      default:
        datasFilter = resJson.datas.filter((data) => data.category === newValue);
        break;
    }
    resetAndSetLists(datasFilter, datasFilter.length);
  };

  // List - Search — dengan debounce 500ms
  const searchTimerRef = React.useRef(null);
  const handleChangeSearch = (event) => {
    const keyword = (event.target.value || '').trim();
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!keyword) {
      // Reset ke tampilan awal (page 1)
      setTabValue('all');
      setIsLoading(true);
      Promise.all([
        getDatas({ offset: 0, limit: PAGE_SIZE }),
        bqo_api.getListTotal(),
      ]).then(([resJson, totalRes]) => {
        setIsLoading(false);
        if (resJson?.datas) {
          const total = totalRes?.metadata?.total || 0;
          resetAndSetLists(resJson.datas, total);
          setCategories(resJson.categories ?? []);
        }
      });
      return;
    }
    // Fetch dengan textfilter dari server
    searchTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      const queryOverride = { query: { freefilter: { search: '!LDISCONT' }, textfilter: { search: keyword } } };
      const resJson = await getDatas({ ...queryOverride, offset: 0, limit: 9999 });
      setIsLoading(false);
      if (!resJson || !resJson.datas) return;
      // Fallback filter client-side juga
      const datasFilter = resJson.datas.filter((data) =>
        data.name.toLowerCase().includes(keyword.toLowerCase())
      );
      resetAndSetLists(datasFilter, datasFilter.length);
      setTabValue('none');
    }, 500);
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

  // Note Form — noteValue dikelola di dalam NoteDialog (tidak di sini)
  // agar list tidak re-render setiap keystroke
  const isNoteExist = (id) => {
    return !!(cart[id]?.note || cart[id]?.note2);
  };
  const handleOpenNoteForm = useCallback((accessorID) => {
    handleOpenDialog(true, accessorID);
  }, []);
  const handleCloseNoteForm = useCallback(() => {
    handleCloseDialog();
  }, []);
  const handleSaveNoteForm = useCallback((value, value2, accessorID) => {
    setCart((prev) => {
      const updated = { ...prev[accessorID] };
      if (value)  updated.note = value;   else delete updated.note;
      if (value2) updated.note2 = value2; else delete updated.note2;
      return { ...prev, [accessorID]: updated };
    });
    handleCloseDialog();
  }, []);

  return (
    <>
      {/* Debug Panel — hanya tampil jika debug_screen: true di app.cfg */}
      {debugEnabled && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', color: '#0f0', fontFamily: 'monospace',
          fontSize: '10px', padding: '4px 8px', maxHeight: '120px', overflowY: 'auto',
          pointerEvents: 'none', // tidak menghalangi klik di belakangnya
        }}>
          <div style={{ color: '#ff0', fontWeight: 'bold', marginBottom: 2 }}>
            🐛 tableId:{getTableId() || '-'} | key:{Config.SESSION_KEY()?.substring(0,8) ?? 'null'}
          </div>
          {debugLog.slice(-5).map((l, i) => (
            <div key={i} style={{ color: l.isError ? '#f66' : '#0f0', lineHeight: 1.3 }}>
              [{l.time}] {l.msg}
            </div>
          ))}
        </div>
      )}
      {/* List */}
      <div style={styles.container}>
        {/* List -> Search Bar */}
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar>
            <Grid container justifyContent="space-between" alignItems="center">
              {/* Tombol back hanya tampil di mode non-QR (akses via login biasa) */}
              {!getTableId() && (
                <Grid item xs={1}>
                  <IconButton
                    sx={styles.appBarIcon}
                    onClick={() => { navigate('/'); }}
                  >
                    <BackIcon />
                  </IconButton>
                </Grid>
              )}
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
          {/* Tombol Load More */}
          {hasMore && !isLoading && (
            <Box textAlign="center" my={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                sx={{ borderRadius: 4, px: 4 }}
              >
                {isLoadingMore ? 'Memuat...' : `Muat Lebih Banyak (${totalItems - lists.length} item lagi)`}
              </Button>
            </Box>
          )}
        </Container>
        {/* List -> Copyright */}
        <Container>
          <Typography color="#b7b7b7" variant="body1" component="h4" textAlign="center">
            Powered By <b style={{ color: '#3f50b5' }}>CSA Computer</b>
          </Typography>
        </Container>
      </div>
      {/* Note Form — komponen terpisah agar list tidak re-render saat ketik */}
      <NoteDialog
        open={showDialog.isShow && showDialog.isForm}
        initialValue={showDialog.isShow && showDialog.isForm ? (cart[showDialog.accessorID]?.note || '') : ''}
        initialValue2={showDialog.isShow && showDialog.isForm ? (cart[showDialog.accessorID]?.note2 || '') : ''}
        onSave={(v1, v2) => handleSaveNoteForm(v1, v2, showDialog.accessorID)}
        onClose={handleCloseNoteForm}
      />
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
