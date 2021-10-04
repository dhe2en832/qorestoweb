import { typesData } from '../../../utils/types-data';
import { BSTOCKF } from './bstock_field';

export const headCells = [
  {
    id: BSTOCKF.CSTOCODE,
    numeric: false,
    disablePadding: false,
    label: 'Kode Item',
  },
  {
    id: BSTOCKF.CSTONAME,
    numeric: false,
    disablePadding: false,
    label: 'Nama Item',
  },
  {
    id: BSTOCKF.CSATUAN,
    numeric: false,
    disablePadding: false,
    label: 'Satuan',
  },
  {
    id: BSTOCKF.CPROCODE,
    numeric: false,
    disablePadding: false,
    label: 'Kelompok Item',
  },
  {
    id: BSTOCKF.CFAMCODE,
    numeric: false,
    disablePadding: false,
    label: 'Family',
  },
  {
    id: BSTOCKF.NHRGJUA,
    numeric: true,
    disablePadding: false,
    label: 'Harga (Rp)',
  },
];

export const bodyCells = (row) => [
  {
    value: row[BSTOCKF.CSTOCODE],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSTOCKF.CSTONAME],
    align: 'left',
    type: typesData.TEXT,
  },
  {
    value: row[BSTOCKF.CSATUAN],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSTOCKF.CPROCODE],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSTOCKF.CFAMCODE],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSTOCKF.NHRGJUA],
    align: 'right',
    type: typesData.CURRENCY,
    prefix: 'Rp',
  },
];
