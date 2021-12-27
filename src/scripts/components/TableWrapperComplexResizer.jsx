import React, { memo, useEffect, useCallback } from 'react';
import { useTable, useFlexLayout, useResizeColumns } from 'react-table';
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
import ResetIcon from '@mui/icons-material/Autorenew';
import useResponsive from '../hooks/useResponsive';
import { alignmentConvert } from '../utils/formatter';
import { getStorage } from '../utils/getter';
import DataNotFound from './DataNotFound';
import TablePaginationActions from './TablePaginationActions';
import { Button } from '@mui/material';

function TableWrapperComplexResizer({
  keyName,
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
  dense,
  setDense,
  tableName,
  setColumnWidth,
  columnResize,
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
      background: '#e0e0e0',
      minWidth: 'max-content',
      display: 'flex',
      flexDirection: 'column',
    },
    tableHead: {
      position: 'sticky',
      top: 0,
      left: 0,
      alignSelf: 'flex-start',
      zIndex: 1,
      ...(lists.length === 0 && { width: '100%' }),
    },
    tableHeadCell: (props) => ({
      top: 0,
      left: 0,
      position: 'sticky!important',
      zIndex: 2,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: props.align,
      background: '#e0e0e0',
      fontWeight: 'bold',
      justifyContent: 'center',
    }),
    tableHeadCellSticky: (props) => ({
      top: 0,
      left: 0,
      position: 'sticky!important',
      zIndex: 3,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: props.align,
      background: '#e0e0e0',
      fontWeight: 'bold',
    }),
    tableBody: {
      position: 'relative',
      zIndex: 0,
      top: 0,
      left: 0,
      alignSelf: 'flex-start',
      '& > :hover > td': {
        backgroundColor: theme.palette.secondary.light + '!important',
      },
    },
    tableBodyCell: (props) => ({
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: props.align,
      background: props.bgColor,
    }),
    tableBodyCellSticky: (props) => ({
      position: 'sticky',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      zIndex: 1,
      top: 0,
      left: 0,
      textAlign: props.align,
      background: props.bgColor,
    }),
    tableFooter: {
      width: '100%',
      borderBottom: '1px solid #e0e0e0',
      textAlign: 'center',
      padding: 3,
      display: 'flex',
      flexDirection: 'column',
    },
    tableDenser: {
      display: smUp ? 'inline-flex' : 'none',
      marginLeft: theme.spacing(1),
      '& .MuiFormControlLabel-label': {
        fontSize: '0.875rem',
      },
    },
    tableResetWidth: {
      margin: 1,
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
    tablePaginationWrapper: {
      width: '100%',
      position: 'sticky',
      bottom: 0,
      left: 0,
      zIndex: 2,
      background: theme.palette.background.default,
    },
    resizer: (props) => ({
      display: 'inline-block',
      width: '10px',
      height: '80%',
      position: 'absolute',
      borderLeft: props.isResizing
        ? `4px solid ${theme.palette.secondary.light}`
        : `4px solid ${theme.palette.primary.light}`,
      right: 0,
      top: 5,
      transform: 'translateX(50%)',
      touchAction: 'none',
      userSelect: 'none',
      zIndex: 1,
      cursor: 'col-resize',
    }),
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

  const { getTableProps, headerGroups, rows, prepareRow, state } = useTable(
    {
      columns: columnResize,
      data: lists,
    },
    useResizeColumns,
    useFlexLayout
  );

  const resetColumnWidthState = () => {
    const prevStorage = getStorage(tableName);
    window.localStorage.setItem(tableName, JSON.stringify({ ...prevStorage, columnWidth: {} }));
    setColumnWidth({});
  };

  const columnWidthState = useCallback(() => {
    const prevStorage = getStorage(tableName);
    window.localStorage.setItem(
      tableName,
      JSON.stringify({
        ...prevStorage,
        columnWidth: {
          ...prevStorage.columnWidth,
          ...state.columnResizing.columnWidths,
        },
      })
    );
  }, [state.columnResizing.columnWidths, tableName]);

  useEffect(() => {
    let isActive = true;
    if (isActive) {
      columnWidthState();
    }
    return () => (isActive = false);
  }, [columnWidthState]);

  return (
    <>
      <TableContainer sx={styles.tableContainer} component={mdUp ? Paper : Grid}>
        <Table
          stickyHeader
          {...getTableProps()}
          sx={styles.table}
          aria-label="table-complex"
          size={smUp ? (dense ? 'small' : 'medium') : 'small'}
        >
          <TableHead sx={styles.tableHead}>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell
                    {...column.getHeaderProps({
                      sx:
                        index === 0
                          ? styles.tableHeadCellSticky({
                              align: alignmentConvert(column.align),
                            })
                          : styles.tableHeadCell({
                              align: alignmentConvert(column.align),
                            }),
                    })}
                  >
                    {column.render('Header')}
                    {rows.length !== 0 &&
                      !column.id.includes('nullCell') &&
                      !column.id.includes('actionCell') && (
                        <Box
                          {...column.getResizerProps()}
                          sx={styles.resizer({
                            isResizing: column.isResizing,
                          })}
                        />
                      )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody sx={styles.tableBody}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <TableRow
                  onClick={(event) => (isLookup ? lookupFunc(event, row.values.key) : {})}
                  {...row.getRowProps()}
                >
                  {row.cells.map((cell, index) => (
                    <TableCell
                      {...cell.getCellProps()}
                      sx={
                        index === 0
                          ? styles.tableBodyCellSticky({
                              align: alignmentConvert(cell.column.align),
                              bgColor: (i + 1) % 2 === 0 ? '#fff' : '#eee',
                            })
                          : styles.tableBodyCell({
                              align: alignmentConvert(cell.column.align),
                              bgColor: (i + 1) % 2 === 0 ? '#fff' : '#eee',
                            })
                      }
                    >
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {rows.length < 1 && (
          <Box sx={styles.tableFooter}>
            <DataNotFound keyName={keyName} />
          </Box>
        )}
      </TableContainer>
      <Box sx={styles.tablePaginationWrapper}>
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
          {mdUp && (
            <Grid item>
              <Button
                sx={styles.tableResetWidth}
                variant="contained"
                size="small"
                onClick={resetColumnWidthState}
                startIcon={<ResetIcon />}
              >
                Lebar
              </Button>
            </Grid>
          )}
          <Grid item>
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]}
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

TableWrapperComplexResizer.propTypes = {
  lists: PropTypes.array.isRequired,
  listCount: PropTypes.number,
  setListCount: PropTypes.func.isRequired,
  setOffset: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  isLookup: PropTypes.bool.isRequired,
  dense: PropTypes.bool.isRequired,
  setDense: PropTypes.func.isRequired,
  tableName: PropTypes.string.isRequired,
  setColumnWidth: PropTypes.func.isRequired,
  columnResize: PropTypes.array.isRequired,
};

export default memo(TableWrapperComplexResizer);
