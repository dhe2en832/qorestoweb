import { typesData } from '../../../utils/types-data';
import { BSTOCKF } from './bstock_field';

export const headCells = [
  {
    id: BSTOCKF.CSTOCODE,
    numeric: false,
    disablePadding: false,
    label: 'Kode Item',
    alignment: 'L',
    width: '20'
  },
  {
    id: BSTOCKF.CSTONAME,
    numeric: false,
    disablePadding: false,
    label: 'Nama Item',
    alignment: 'L',
    width: '20'
  },
  {
    id: BSTOCKF.CSATUAN,
    numeric: false,
    disablePadding: false,
    label: 'Satuan',
    alignment: 'L',
    width: '20'
  },
  {
    id: BSTOCKF.CPROCODE,
    numeric: false,
    disablePadding: false,
    label: 'Kelompok Item',
    alignment: 'L',
    width: '20'
  },
  {
    id: BSTOCKF.CFAMCODE,
    numeric: false,
    disablePadding: false,
    label: 'Family',
    alignment: 'L',
    width: '20'
  },
  {
    id: BSTOCKF.NHRGJUA,
    numeric: true,
    disablePadding: false,
    label: 'Harga',
    alignment: 'L',
    width: '20'
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
