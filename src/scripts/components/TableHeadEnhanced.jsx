import React, { memo } from 'react';

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import ActionIcon from '@mui/icons-material/MoreVert';

function TableHeadEnhanced({
  keyName,
  styles,
  headCells,
  order,
  orderBy,
  onRequestSort,
  isLookup,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={styles.tableHeader}>
      <TableRow>
        {headCells.map((headCell, index) => (
          <TableCell
            sx={
              index === 0 ? styles.stickyHeader : styles.stickyHeaderSecondary
            }
            key={(keyName.replace(/\s/g, '') + '_htc_' + index).toString()}
            align={headCell.numeric ? 'right' : 'center'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id && (
                  <Box component="span" sx={styles.visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
        {!isLookup && (
          <TableCell
            align="center"
            padding="none"
            sx={styles.stickyHeaderSecondary}
          >
            <ActionIcon />
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}

TableHeadEnhanced.propTypes = {
  keyName: PropTypes.string.isRequired,
  styles: PropTypes.object.isRequired,
  headCells: PropTypes.array.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  smUp: PropTypes.bool,
};

export default memo(TableHeadEnhanced);
