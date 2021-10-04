import { BSOFHEAD, BSOFITEM } from './bso_field';
export const confName = 'Sales Order',
  confPrimKey = BSOFHEAD.CSONUM,
  confSecKey = BSOFHEAD.CUSTOMER._.CCUSID,
  confQtyKey = BSOFITEM.NQSO;
