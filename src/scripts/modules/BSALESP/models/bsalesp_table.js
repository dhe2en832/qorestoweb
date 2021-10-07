import { typesData } from '../../../utils/types-data';
import { BSALESPF } from './bsalesp_field';

export const headCells = [
  {
    id: BSALESPF.CSALESID,
    numeric: false,
    disablePadding: false,
    label: 'ID SalesP',
  },
  {
    id: BSALESPF.CSALESNAME,
    numeric: false,
    disablePadding: false,
    label: 'Nama Sales Person',
  },
  {
    id: BSALESPF.CKOTA,
    numeric: false,
    disablePadding: false,
    label: 'Kota',
  },
];

export const bodyCells = (row) => [
  {
    value: row[BSALESPF.CSALESID],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSALESPF.CSALESNAME],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSALESPF.CKOTA],
    align: 'center',
    type: typesData.TEXT,
  },
];
