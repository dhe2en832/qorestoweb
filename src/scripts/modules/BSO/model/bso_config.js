import { BSOFHEAD, BSOFITEM } from './bso_field';
export const confName = 'Sales Order',
  tableName = 'TBLBSO',
  confPrimKey = BSOFHEAD.CSONUM,
  confSecKey = BSOFHEAD.CUSTOMER._.CCUSID,
  confQtyKey = BSOFITEM.NQSO;
