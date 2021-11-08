import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import Container from '@mui/material/Container';
import InputBase from '@mui/material/InputBase';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import Hidden from '@mui/material/Hidden';
import Button from '@mui/material/Button';
import FoldIcon from '@mui/icons-material/UnfoldLess';
import UnfoldIcon from '@mui/icons-material/UnfoldMore';
import useTheme from '@mui/material/styles/useTheme';
import CurrencyFormat from './CurrencyFormat';
import { amounter, taxer } from '../utils/calculate';

function GrandTotalWrapper({
  total,
  discount,
  tax,
  totalAfterDiscAndTax,
  adjustment_description,
  adjustment,
  grandTotal,
  submit,
  isSubmit,
  isEditDiscPPN,
  handleChangeDiscPPN,
  disableDiscPPN,
  headers,
  setIsEditHeader,
}) {
  const theme = useTheme();
  const styles = {
    button: {
      backgroundColor: theme.palette.custom.thBackground,
      color: '#000000de',
    },
    footer: {
      position: 'fixed',
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: theme.palette.secondary.main,
      padding: '10px',
      zIndex: 10,
    },
    totaler: {
      backgroundColor: theme.palette.custom.thBackground,
      padding: '5px',
      marginBottom: '4px',
      borderRadius: '5px',
      width: '100%',
    },
    input: { width: '5.5ch', background: '#fff', padding: '0 5px', height: '2ch' },
  };
  const [openTotal, setOpenTotal] = useState(false);
  const totalRender = () => {
    return (
      <Grid item container direction="column" sx={styles.totaler}>
        <Collapse in={openTotal}>
          <Grid container>
            <Grid item container xs justifyContent="flex-start">
              Total:
            </Grid>
            <Grid item container xs justifyContent="flex-end">
              <CurrencyFormat prefix="Rp" value={total || 0} />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item container xs justifyContent="flex-start" spacing={1} alignItems="center">
              {isEditDiscPPN ? (
                <>
                  <Grid item>Disc </Grid>
                  <Grid item>
                    <NumberFormat
                      name={'npctdisc'}
                      type="tel"
                      sx={styles.input}
                      decimalScale={2}
                      fixedDecimalScale={true}
                      autoComplete="off"
                      customInput={InputBase}
                      onBlur={() => setIsEditHeader && setIsEditHeader(false)}
                      onFocus={(event) => {
                        event.target.select();
                        setIsEditHeader && setIsEditHeader(true);
                      }}
                      onChange={handleChangeDiscPPN}
                      value={headers['npctdisc']}
                      disabled={disableDiscPPN}
                    />{' '}
                    %
                  </Grid>
                </>
              ) : (
                <Grid item>Disc. {discount || 0} %:</Grid>
              )}
            </Grid>
            <Grid item container xs justifyContent="flex-end">
              <CurrencyFormat prefix="Rp" value={amounter(total || 0, discount || 0)} />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item container xs justifyContent="flex-start" spacing={1} alignItems="center">
              {isEditDiscPPN ? (
                <>
                  <Grid item>PPN </Grid>
                  <Grid item>
                    <NumberFormat
                      name={'npctppn'}
                      type="tel"
                      sx={styles.input}
                      decimalScale={2}
                      fixedDecimalScale={true}
                      autoComplete="off"
                      customInput={InputBase}
                      onBlur={() => setIsEditHeader && setIsEditHeader(false)}
                      onFocus={(event) => {
                        event.target.select();
                        setIsEditHeader && setIsEditHeader(true);
                      }}
                      onChange={handleChangeDiscPPN}
                      value={headers['npctppn']}
                      disabled={disableDiscPPN}
                    />{' '}
                    %
                  </Grid>
                </>
              ) : (
                <Grid item>PPN {tax || 0} %:</Grid>
              )}
            </Grid>
            <Grid item container xs justifyContent="flex-end">
              <CurrencyFormat prefix="Rp" value={taxer(total || 0, discount || 0, tax || 0)} />
            </Grid>
          </Grid>
          {adjustment_description !== '' && (
            <>
              <hr />
              <Grid container>
                <Grid item container xs justifyContent="flex-start">
                  Total,Disc,Tax:
                </Grid>
                <Grid item container xs justifyContent="flex-end">
                  <CurrencyFormat prefix="Rp" value={totalAfterDiscAndTax || 0} />
                </Grid>
              </Grid>
            </>
          )}
          {adjustment_description !== '' && (
            <Grid container>
              <Grid item container xs justifyContent="flex-start">
                {adjustment_description}:
              </Grid>
              <Grid item container xs justifyContent="flex-end">
                <CurrencyFormat prefix="Rp" value={adjustment || 0} />
              </Grid>
            </Grid>
          )}
          <hr />
        </Collapse>
        <Grid container alignItems="center">
          <Grid item container xs justifyContent="flex-start">
            Grand Total :
          </Grid>
          <Grid item container xs justifyContent="flex-end">
            <CurrencyFormat prefix="Rp" value={grandTotal || 0} />
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container id="footer" maxWidth="xl" sx={styles.footer}>
      <Hidden mdUp>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item container justifyContent="center">
            {totalRender()}
          </Grid>
        </Grid>
      </Hidden>
      <Grid container spacing={1}>
        <Grid item container xs={6} md={4} justifyContent="flex-start" alignContent="flex-end">
          <Button
            variant="contained"
            sx={styles.button}
            size="small"
            onClick={submit}
            disabled={isSubmit}
          >
            <b>{isSubmit ? 'Tunggu...' : 'Keluar'}</b>
          </Button>
        </Grid>
        <Hidden mdDown>
          <Grid item container md={4} justifyContent="center">
            {totalRender()}
          </Grid>
        </Hidden>
        <Grid item container xs={6} md={4} justifyContent="flex-end">
          <Button
            variant="contained"
            sx={styles.button}
            size="small"
            onClick={() => setOpenTotal(!openTotal)}
            aria-label="hide-show-grandtotal"
          >
            {openTotal ? <FoldIcon fontSize="small" /> : <UnfoldIcon fontSize="small" />}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

GrandTotalWrapper.propTypes = {
  total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  tax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  totalAfterDiscAndTax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  adjustment_description: PropTypes.string,
  adjustment: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  grandTotal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  submit: PropTypes.func.isRequired,
  isSubmit: PropTypes.bool.isRequired,
  isEditDiscPPN: PropTypes.bool,
  handleChangeDiscPPN: PropTypes.func,
  disableDiscPPN: PropTypes.bool,
  headers: PropTypes.any,
  setIsEditHeader: PropTypes.func,
};

GrandTotalWrapper.defaultProps = {
  total: 0,
  discount: 0,
  tax: 0,
  totalAfterDiscAndTax: 0,
  adjustment_description: '',
  adjustment: 0,
  grandTotal: 0,
  submit: () => {},
  isSubmit: false,
  isEditDiscPPN: false,
  handleChangeDiscPPN: () => {},
  disableDiscPPN: false,
  headers: null,
  setIsEditHeader: () => {},
};

export default memo(GrandTotalWrapper);
