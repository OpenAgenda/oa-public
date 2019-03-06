import React from 'react';
import NotFound from '@openagenda/react-utils/dist/NotFound';
import { AgendaApp, AgendaDashboard } from '../../containers';

export default function ( prefix = '', notFoundKey ) {
  return [
    {
      component: AgendaApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: AgendaDashboard },
        { path: `${prefix}/activities`, component: AgendaDashboard },
        { component: NotFound, notFoundKey }
      ]
    }
  ];
};
