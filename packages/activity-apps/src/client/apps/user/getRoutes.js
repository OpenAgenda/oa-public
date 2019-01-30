import React from 'react';
import NotFound from '@openagenda/react-utils/dist/NotFound';
import { UserApp, UserDashboard } from '../../containers';

export default function ( prefix = '' ) {
  return [
    {
      component: UserApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: UserDashboard },
        { component: NotFound }
      ]
    }
  ];
};
