import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const AddElem = ({ url, title }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      component={Link}
      to={`${url}/add`}
      sx={{ px: 0 }}
      size="small"
    >
      <AddIcon />
    </Button>
  );
};

export const EditElem = ({ url, id }) => {
  return (
    <Button
      size="small"
      variant="text"
      color="primary"
      component={Link}
      to={`${url}/edit/${id}`}
      aria-label={`edit-button`}
    >
      <EditIcon fontSize="small" />
    </Button>
  );
};

export const DeleteElem = ({ click }) => {
  return (
    <Button
      size="small"
      variant="text"
      color="error"
      onClick={click}
      aria-label={`delete-button`}
    >
      <DeleteIcon fontSize="small" />
    </Button>
  );
};
