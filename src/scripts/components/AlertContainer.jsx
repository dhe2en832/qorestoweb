import React from 'react';
import Box from '@mui/material/Box';

export default function AlertContainer({ idElem }) {
  return <Box id={`AlertDialogNested_${idElem}`}></Box>;
}
