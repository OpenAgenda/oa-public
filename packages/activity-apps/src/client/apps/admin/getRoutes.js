import React from 'react';
import { AdminApp, AdminDashboard } from '../../containers';

export default function ( prefix = '' ) {
  return [
    {
      component: AdminApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: AdminDashboard },
        {
          component: ( { staticContext = {} } ) => {
            staticContext.status = 404;
            return null;
          }
        }
      ]
    }
  ];
};
