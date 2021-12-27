import { typesData } from '../../../utils/types-data';
import { BSOFHEAD } from './bso_field';

export const headCells = [
  {
    id: BSOFHEAD.CSONUM,
    numeric: false,
    disablePadding: false,
    label: 'No. SO',
    alignment: 'L',
    width: '10'
  },
  {
    id: BSOFHEAD.DSODATE,
    numeric: false,
    disablePadding: false,
    label: 'Tgl. SO',
    alignment: 'C',
    width: '10'
  },
  {
    id: BSOFHEAD.CUSTOMER._.CCUSID,
    numeric: false,
    disablePadding: false,
    label: 'Customer',
    alignment: 'L',
    width: '15'
  },
  {
    id: BSOFHEAD.CCUSTPO,
    numeric: false,
    disablePadding: false,
    label: 'PO Customer',
    alignment: 'C',
    width: '5'
  },
  {
    id: BSOFHEAD.CWHSEID,
    numeric: false,
    disablePadding: false,
    label: 'Kode Gudang',
    alignment: 'L',
    width: '15'
  },
  {
    id: BSOFHEAD.CSALESID,
    numeric: false,
    disablePadding: false,
    label: 'Sales Person',
    alignment: 'C',
    width: '10'
  },
];

export const bodyCells = (row) => [
  {
    value: row[BSOFHEAD.CSONUM],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSOFHEAD.DSODATE],
    align: 'center',
    type: typesData.DATE,
  },
  {
    value: row[BSOFHEAD.CUSTOMER._.CCUSID],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSOFHEAD.CCUSTPO],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSOFHEAD.CWHSEID],
    align: 'center',
    type: typesData.TEXT,
  },
  {
    value: row[BSOFHEAD.CSALESID],
    align: 'center',
    type: typesData.TEXT,
  },
];
