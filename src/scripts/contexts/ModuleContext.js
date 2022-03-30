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
        active: 'N',
        component: lazy(() => import('../modules/BSO')),
      },
      {
        id: 'BQO',
        title: 'Menu',
        pathLocation: '/menu',
        path: '/*',
        active: 'Y',
        component: lazy(() => import('../modules/BQO')),
      },
    ],
  },
];

export default ModuleContext;
