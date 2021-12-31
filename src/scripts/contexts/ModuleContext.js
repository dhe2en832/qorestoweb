import { lazy } from 'react';

const ModuleContext = [
  {
    name: 'Master',
    menu: [
      {
        id: 'BSTOCK',
        title: 'Items / Stock',
        pathLocation: '/bstock',
        path: '/bstock/*',
        active: 'N',
        component: lazy(() => import('../modules/BSTOCK')),
      },
    ],
  },
  {
    name: 'Order',
    menu: [
      {
        id: 'BSO',
        title: 'Sales Order',
        pathLocation: '/bso',
        path: '/bso/*',
        active: 'Y',
        component: lazy(() => import('../modules/BSO')),
      },
    ],
  },
];

export default ModuleContext;
