import React, { memo } from 'react';
import PropTypes from 'prop-types';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';

function TableWrapperSimple({ children }) {
  const styles = {
    table: {
      minWidth: 1024,
    },
  };
  return (
    <TableContainer component={Paper}>
      <Table sx={styles.table}>{children}</Table>
    </TableContainer>
  );
}

TableWrapperSimple.propTypes = {
  children: PropTypes.array.isRequired,
};

export default memo(TableWrapperSimple);
