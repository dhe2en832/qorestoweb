import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import NoImage from '../../images/no-thumbnail.png';
import useResponsive from '../hooks/useResponsive';
import { getComparator, stableSort } from '../utils/comparator';
import { dateToString, toCurrency } from '../utils/formatter';
import { EditElem, DeleteElem } from './ButtonActions';
import DataNotFound from './DataNotFound';
import TableHeadEnhanced from './TableHeadEnhanced';
import TablePaginationActions from './TablePaginationActions';

function TableWrapperComplex({
  keyName,
  keyID,
  keyURL,
  headCells,
  bodyCells,
  initOrder,
  setFilterBy,
  filteredDatas,
  isLookup,
  lookupFunc,
  handleDelete,
}) {
  const { theme, mdUp } = useResponsive();
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
      padding: theme.spacing(1),
      borderBottomLeftRadius: '0.2em',
      borderBottomRightRadius: '0.2em',
      marginBottom: isLookup ? 0 : theme.spacing(2),
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    stickyBody: {
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 1,
      background: theme.palette.background.default,
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
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(initOrder);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setFilterBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  // const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredDatas.length - page * rowsPerPage);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredDatas.length) : 0;

  return (
    <>
      <TableContainer sx={styles.tableContainer} component={mdUp ? Paper : Grid}>
        <Table sx={styles.table} aria-label="table-complex" size={dense ? 'small' : 'medium'}>
          <TableHeadEnhanced
            keyName={keyName}
            styles={styles}
            headCells={headCells}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            isLookup={isLookup}
          />
          <TableBody>
            {filteredDatas.length < 1 ? (
              <TableRow>
                <TableCell colSpan={99} align="center">
                  <DataNotFound keyName={keyName} />
                </TableCell>
              </TableRow>
            ) : (
              (rowsPerPage > 0
                ? stableSort(filteredDatas, getComparator(order, orderBy)).slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : stableSort(filteredDatas, getComparator(order, orderBy))
              ).map((row, index) => (
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
                      {data.type === 'date' && dateToString(data.value)}
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
                      <EditElem id={row[keyID]} url={keyURL} />
                      <DeleteElem click={(event) => handleDelete(event, row[keyID], keyName)} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
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
        >
          <Grid item>
            <FormControlLabel
              sx={styles.tableDenser}
              control={<Checkbox size="small" checked={dense} onChange={handleChangeDense} />}
              label="Dense Table"
            />
          </Grid>
          <Grid item>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100, { label: 'All', value: -1 }]}
              component="div"
              count={filteredDatas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
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
  initOrder: PropTypes.string.isRequired,
  setFilterBy: PropTypes.func.isRequired,
  filteredDatas: PropTypes.array.isRequired,
  isLookup: PropTypes.bool.isRequired,
  lookupFunc: PropTypes.func,
  handleDelete: PropTypes.func,
};

export default memo(TableWrapperComplex);
