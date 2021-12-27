import { typesData } from '../../../utils/types-data';
import { BCUSTF } from './bcust_field';

export const headCells = [
  {
    id: BCUSTF.CCUSID,
    numeric: false,
    disablePadding: false,
    label: 'ID Customer',
    alignment: 'L',
    width: '20'
  },
  {
    id: BCUSTF.CCUSNAM,
    numeric: false,
    disablePadding: false,
    label: 'Nama',
    alignment: 'C',
    width: '20'
  },
  {
    id: BCUSTF.CINITIAL,
    numeric: false,
    disablePadding: false,
    label: 'Alias',
    alignment: 'C',
    width: '20'
  },
  {
    id: BCUSTF.CSTREET,
    numeric: false,
    disablePadding: false,
    label: 'Alamat',
    alignment: 'C',
    width: '20'
  },
  {
    id: BCUSTF.CKOTA,
    numeric: false,
    disablePadding: false,
    label: 'Kota',
    alignment: 'C',
    width: '20'
  },
  {
    id: BCUSTF.CSTATE,
    numeric: false,
    disablePadding: false,
    label: 'Daerah',
    alignment: 'C',
    width: '20'
  },
  {
    id: BCUSTF.CNPWP,
    numeric: false,
    disablePadding: false,
    label: 'NPWP',
    alignment: 'C',
    width: '20'
  },
  {
    id: BCUSTF.CNOTELP,
    numeric: false,
    disablePadding: false,
    label: 'No. Telp',
    alignment: 'C',
    width: '20'
  },
];

export const bodyCells = (row) => [
  {
    value: row[BCUSTF.CCUSID],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BCUSTF.CCUSNAM],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BCUSTF.CINITIAL],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BCUSTF.CSTREET],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BCUSTF.CKOTA],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BCUSTF.CSTATE],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BCUSTF.CNPWP],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BCUSTF.CNOTELP],
    align: 'center',
    type: typesData.TEXT,
  },
];
