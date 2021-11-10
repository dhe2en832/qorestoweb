import React, { memo } from 'react';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import ActionIcon from '@mui/icons-material/MoreVert';
import NoImage from '../../images/no-thumbnail.png';
import useResponsive from '../hooks/useResponsive';
import { stringToDate, toCurrency } from '../utils/formatter';
import { EditElem, DeleteElem } from './ButtonActions';
import DataNotFound from './DataNotFound';
import TablePaginationActions from './TablePaginationActions';

function TableWrapperComplex({
  keyName,
  keyID,
  keyURL,
  headCells,
  bodyCells,
  lists,
  listCount,
  setListCount,
  setOffset,
  limit,
  setLimit,
  page,
  setPage,
  isLookup,
  lookupFunc,
  handleDelete,
  dense,
  setDense,
}) {
  const { theme, mdUp, smUp, smDown } = useResponsive();
  const styles = {
    tableContainer: {
      width: '100%',
      height: isLookup ? 'auto' : mdUp ? 'auto' : '76.5vh',
      [theme.breakpoints.up('md')]: {
        paddingLeft: isLookup ? theme.spacing(2) : theme.spacing(0),
        paddingRight: isLookup ? theme.spacing(2) : theme.spacing(0),
      },
      overflowX: isLookup ? 'initial' : mdUp ? 'initial' : 'auto',
      marginTop: isLookup ? theme.spacing(0) : theme.spacing(1),
    },
    table: {
      minWidth: 450,
    },
    tableDenser: {
      display: smUp ? 'inline-flex' : 'none',
      marginLeft: theme.spacing(1),
      '& .MuiFormControlLabel-label': {
        fontSize: '0.875rem',
      },
    },
    tableImage: {
      height: 50,
      width: 80,
    },
    tableHeader: {
      '& .MuiTableCell-root': {
        fontWeight: 'bold',
        backgroundColor: theme.palette.custom.thBackground,
        color: theme.palette.custom.thText,
      },
    },
    tableBody: {
      '&:hover': {
        backgroundColor: theme.palette.primary.light + '!important',
      },
    },
    tablePagination: {
      backgroundColor: theme.palette.grey[300],
      borderBottomLeftRadius: '0.2em',
      borderBottomRightRadius: '0.2em',
      marginBottom: isLookup ? 0 : theme.spacing(1),
    },
    tablePaginationActions: {
      '& .MuiTablePagination-toolbar': {
        display: smUp ? 'flex' : 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
      },
      '& .MuiTablePagination-spacer': {
        display: 'none',
      },
      '& .MuiTablePagination-selectLabel': {
        ...(smDown && { marginBottom: 0, marginLeft: 1 }),
      },
      '& .MuiTablePagination-displayedRows': {
        ...(smDown && { marginBottom: 0, marginRight: '5px' }),
      },
    },
    stickyBody: {
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 1,
      background: mdUp ? '' : theme.palette.background.default,
    },
    stickyHeader: {
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 3,
      background: theme.palette.custom.thBackground,
    },
    stickyHeaderSecondary: {
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 2,
      background: theme.palette.custom.thBackground,
    },
    stickyFooter: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        paddingLeft: isLookup ? theme.spacing(2) : theme.spacing(0),
        paddingRight: isLookup ? theme.spacing(2) : theme.spacing(0),
      },
      position: 'sticky',
      bottom: 0,
      left: 0,
      zIndex: 2,
      background: theme.palette.background.default,
    },
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setOffset(newPage * limit);
  };

  const handleChangeRowsPerPage = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setListCount(null);
    setOffset(0);
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const labelRows = ({ from, to, count }) => {
    return `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`;
  };

  // const emptyRows = rowsPerPage - Math.min(rowsPerPage, lists.length - page * rowsPerPage);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * limit - listCount || 0) : 0;

  return (
    <>
      <TableContainer sx={styles.tableContainer} component={mdUp ? Paper : Grid}>
        <Table
          sx={styles.table}
          aria-label="table-complex"
          size={smUp ? (dense ? 'small' : 'medium') : 'small'}
        >
          <TableHead sx={styles.tableHeader}>
            <TableRow>
              {headCells.map((headCell, index) => (
                <TableCell
                  sx={index === 0 ? styles.stickyHeader : styles.stickyHeaderSecondary}
                  key={(keyName.replace(/\s/g, '') + '_htc_' + index).toString()}
                  align={headCell.numeric ? 'right' : 'center'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                >
                  {headCell.label}
                </TableCell>
              ))}
              {!isLookup && (
                <TableCell
                  align="center"
                  padding="none"
                  sx={{ ...styles.stickyHeaderSecondary, ...(dense && { paddingTop: 0.8 }) }}
                >
                  <ActionIcon fontSize="small" />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {lists.length < 1 ? (
              <TableRow>
                <TableCell colSpan={99} align="center">
                  <DataNotFound keyName={keyName} />
                </TableCell>
              </TableRow>
            ) : (
              lists.map((row, index) => (
                <TableRow
                  key={(keyName.replace(/\s/g, '') + '_btr_' + index).toString()}
                  onClick={
                    isLookup
                      ? row['lselect'] !== undefined
                        ? row['lselect'] === 'Y'
                          ? (event) => lookupFunc(event, row)
                          : null
                        : (event) => lookupFunc(event, row)
                      : null
                  }
                  hover
                >
                  {bodyCells(row).map((data, index) => (
                    <TableCell
                      sx={index === 0 ? styles.stickyBody : null}
                      align={data.align}
                      key={(keyName.replace(/\s/g, '') + '_btc_' + index).toString()}
                    >
                      {data.type === 'text' && data.value}
                      {data.type === 'date' && stringToDate(data.value)}
                      {data.type === 'image' && (
                        <LazyLoad height={50} style={{ display: 'flex', justifyContent: 'center' }}>
                          <Avatar
                            alt={row[keyID]}
                            sx={styles.tableImage}
                            src={data.value || NoImage}
                            variant="rounded"
                          />
                        </LazyLoad>
                      )}
                      {data.type === 'currency' &&
                        (data.prefix || '') + toCurrency(data.value || 0) + (data.suffix || '')}
                    </TableCell>
                  ))}
                  {!isLookup && (
                    <TableCell align="center">
                      <EditElem id={row['key']} url={keyURL} />
                      <DeleteElem
                        click={(event) => handleDelete(event, row['key'], keyName)}
                        disabled
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {emptyRows > 0 && (
              <TableRow sx={{ height: (dense ? 33 : 53) * emptyRows }}>
                <TableCell colSpan={headCells.length + 1} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={styles.stickyFooter}>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          sx={styles.tablePagination}
          spacing={0}
        >
          <Grid item>
            <FormControlLabel
              sx={styles.tableDenser}
              control={<Checkbox size="small" checked={dense} onChange={handleChangeDense} />}
              label="Rapatkan Baris"
            />
          </Grid>
          <Grid item>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={listCount || 0}
              rowsPerPage={limit}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
              sx={styles.tablePaginationActions}
              labelDisplayedRows={labelRows}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

TableWrapperComplex.propTypes = {
  keyName: PropTypes.string.isRequired,
  keyID: PropTypes.string.isRequired,
  keyURL: PropTypes.string,
  headCells: PropTypes.array.isRequired,
  bodyCells: PropTypes.func.isRequired,
  lists: PropTypes.array.isRequired,
  listCount: PropTypes.number,
  setListCount: PropTypes.func.isRequired,
  setOffset: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  isLookup: PropTypes.bool.isRequired,
  lookupFunc: PropTypes.func,
  handleDelete: PropTypes.func,
  dense: PropTypes.bool.isRequired,
  setDense: PropTypes.func.isRequired,
};

export default memo(TableWrapperComplex);
