import React from 'react';
import { UserApp, UserDashboard } from '../../containers';

export default function ( prefix = '' ) {
  return [
    {
      component: UserApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: UserDashboard },
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
