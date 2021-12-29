import { typesData } from '../../../utils/types-data';
import { BWHSEF } from './bwhse_field';

export const headCells = [
  {
    id: BWHSEF.CWHSEID,
    numeric: false,
    disablePadding: false,
    label: 'Kode Gudang',
    alignment: 'L',
    width: '20'
  },
  {
    id: BWHSEF.CWHSENAME,
    numeric: false,
    disablePadding: false,
    label: 'Nama Gudang',
    alignment: 'L',
    width: '20'
  },
  {
    id: BWHSEF.CWHSETYPE,
    numeric: false,
    disablePadding: false,
    label: 'Jenis Gudang',
    alignment: 'L',
    width: '20'
  },
  {
    id: BWHSEF.CWPCODE,
    numeric: false,
    disablePadding: false,
    label: 'Price Code',
    alignment: 'L',
    width: '20'
  },
  {
    id: BWHSEF.CSTREET,
    numeric: false,
    disablePadding: false,
    label: 'Alamat',
    alignment: 'L',
    width: '20'
  },
  {
    id: BWHSEF.CNOTELP,
    numeric: false,
    disablePadding: false,
    label: 'No. Telp',
    alignment: 'L',
    width: '20'
  },
];

export const bodyCells = (row) => [
  {
    value: row[BWHSEF.CWHSEID],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BWHSEF.CWHSENAME],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BWHSEF.CWHSETYPE],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BWHSEF.CWPCODE],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BWHSEF.CSTREET],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BWHSEF.CNOTELP],
    align: 'center',
    type: typesData.TEXT,
  },
];
