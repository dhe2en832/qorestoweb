import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const AddElem = ({ url, title, state, fullWidth }) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{ px: 0 }}
      onClick={() => {
        navigate(`${url}/add`, { state: state || {} });
      }}
      size="small"
      fullWidth={fullWidth}
    >
      <AddIcon />
    </Button>
  );
};

export const EditElem = ({ url, id }) => {
  const navigate = useNavigate();
  return (
    <Button
      size="small"
      variant="text"
      color="primary"
      onClick={() => {
        navigate(`${url}/edit/${id}`);
      }}
      aria-label={`edit-button`}
    >
      <EditIcon fontSize="small" />
    </Button>
  );
};

export const DeleteElem = ({ click }) => {
  return (
    <Button size="small" variant="text" color="error" onClick={click} aria-label={`delete-button`}>
      <DeleteIcon fontSize="small" />
    </Button>
  );
};
