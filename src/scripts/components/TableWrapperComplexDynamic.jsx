import React, { memo } from 'react';
import PropTypes from 'prop-types';
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
import ActionIcon from '@mui/icons-material/MoreVert';
import useResponsive from '../hooks/useResponsive';
import { alignmentConvert } from '../utils/formatter';
import { EditElem, DeleteElem } from './ButtonActions';
import DataNotFound from './DataNotFound';
import TablePaginationActions from './TablePaginationActions';

function TableWrapperComplexDynamic({
  keyName,
  keyURL,
  columns,
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
      height: isLookup ? 'auto' : mdUp ? '72.5vh' : '76.5vh',
      overflowX: isLookup ? 'initial' : 'auto',
      marginTop: isLookup ? theme.spacing(0) : theme.spacing(1),
    },
    table: {
      minWidth: 'max-content',
    },
    tableDenser: {
      display: smUp ? 'inline-flex' : 'none',
      marginLeft: theme.spacing(1),
      '& .MuiFormControlLabel-label': {
        fontSize: '0.875rem',
      },
    },
    tableHeader: {
      '& .MuiTableCell-root': {
        fontWeight: 'bold',
        backgroundColor: theme.palette.custom.thBackground,
        color: theme.palette.custom.thText,
      },
    },
    tableBody: {
      '& > :hover': {
        background: theme.palette.secondary.light + '!important',
        '& > :nth-of-type(1)': {
          background: theme.palette.secondary.light + '!important',
        },
      },
    },
    tableRow: {
      ':nth-of-type(odd)': {
        background: theme.palette.grey[100],
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
    normalBody: (width) => ({
      width: width + 'ch',
    }),
    stickyBodyOdd: (width) => ({
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 1,
      width: width + 'ch',
      background: theme.palette.grey[100],
    }),
    stickyBodyEven: (width) => ({
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 1,
      width: width + 'ch',
      background: theme.palette.background.default,
    }),
    stickyHeader: (width) => ({
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 3,
      background: theme.palette.custom.thBackground,
      width: width + 'ch',
    }),
    stickyHeaderSecondary: (width) => ({
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 2,
      background: theme.palette.custom.thBackground,
      width: width + 'ch',
    }),
    stickyFooter: {
      width: '100%',
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
              {columns.map(
                (col, index) =>
                  index > 0 && (
                    <TableCell
                      sx={
                        index === 1
                          ? styles.stickyHeader(col.width)
                          : styles.stickyHeaderSecondary(col.width)
                      }
                      key={(keyName.replace(/\s/g, '') + '_htc_' + index).toString()}
                      align={alignmentConvert(col.alignment)}
                    >
                      {col.title}
                    </TableCell>
                  )
              )}
              {!isLookup && (
                <TableCell
                  align="center"
                  padding="none"
                  sx={{ ...styles.stickyHeaderSecondary(4), ...(dense && { paddingTop: 0.8 }) }}
                >
                  <ActionIcon fontSize="small" />
                </TableCell>
              )}
              {isLookup && columns.length < 6 && (
                <>
                  <TableCell align="center" sx={styles.stickyHeaderSecondary(10)}></TableCell>
                  <TableCell align="center" sx={styles.stickyHeaderSecondary(10)}></TableCell>
                  <TableCell align="center" sx={styles.stickyHeaderSecondary(10)}></TableCell>
                  <TableCell align="center" sx={styles.stickyHeaderSecondary(10)}></TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody sx={styles.tableBody}>
            {lists.length < 1 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align="center">
                  <DataNotFound keyName={keyName} />
                </TableCell>
              </TableRow>
            ) : (
              lists.map((row, mainIndex) => (
                <TableRow
                  key={(keyName.replace(/\s/g, '') + '_btr_' + mainIndex).toString()}
                  onClick={
                    isLookup
                      ? row['lselect'] !== undefined
                        ? row['lselect'] === 'Y'
                          ? (event) => lookupFunc(event, row[0])
                          : null
                        : (event) => lookupFunc(event, row[0])
                      : null
                  }
                  sx={styles.tableRow}
                >
                  {row.map(
                    (data, index) =>
                      index > 0 && (
                        <TableCell
                          sx={
                            index === 1
                              ? (mainIndex + 1) % 2 === 0
                                ? styles.stickyBodyEven(columns[index].width)
                                : styles.stickyBodyOdd(columns[index].width)
                              : styles.normalBody(columns[index].width)
                          }
                          align={alignmentConvert(columns[index].alignment)}
                          key={(keyName.replace(/\s/g, '') + '_btc_' + index).toString()}
                        >
                          {data}
                        </TableCell>
                      )
                  )}
                  {!isLookup && (
                    <TableCell align="center" sx={styles.normalBody(10)}>
                      <EditElem id={row[0]} url={keyURL} />
                      <DeleteElem
                        click={(event) => handleDelete(event, row[0], keyName)}
                        disabled
                      />
                    </TableCell>
                  )}
                  {isLookup && columns.length < 6 && (
                    <>
                      <TableCell align="center" sx={styles.normalBody(10)}></TableCell>
                      <TableCell align="center" sx={styles.normalBody(10)}></TableCell>
                      <TableCell align="center" sx={styles.normalBody(10)}></TableCell>
                      <TableCell align="center" sx={styles.normalBody(10)}></TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
            {emptyRows > 0 && (
              <TableRow sx={{ height: (dense ? 33 : 53) * emptyRows }}>
                <TableCell colSpan={columns.length + 1} />
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

TableWrapperComplexDynamic.propTypes = {
  keyName: PropTypes.string.isRequired,
  keyURL: PropTypes.string,
  columns: PropTypes.array.isRequired,
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

export default memo(TableWrapperComplexDynamic);
