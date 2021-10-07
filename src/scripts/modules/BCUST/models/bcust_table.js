import { typesData } from '../../../utils/types-data';
import { BCUSTF } from './bcust_field';

export const headCells = [
  {
    id: BCUSTF.CCUSID,
    numeric: false,
    disablePadding: false,
    label: 'ID Customer',
  },
  {
    id: BCUSTF.CCUSNAM,
    numeric: false,
    disablePadding: false,
    label: 'Nama',
  },
  {
    id: BCUSTF.CINITIAL,
    numeric: false,
    disablePadding: false,
    label: 'Alias',
  },
  {
    id: BCUSTF.CSTREET,
    numeric: false,
    disablePadding: false,
    label: 'Alamat',
  },
  {
    id: BCUSTF.CKOTA,
    numeric: false,
    disablePadding: false,
    label: 'Kota',
  },
  {
    id: BCUSTF.CSTATE,
    numeric: false,
    disablePadding: false,
    label: 'Daerah',
  },
  {
    id: BCUSTF.CNPWP,
    numeric: false,
    disablePadding: false,
    label: 'NPWP',
  },
  {
    id: BCUSTF.CNOTELP,
    numeric: false,
    disablePadding: false,
    label: 'No. Telp',
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
