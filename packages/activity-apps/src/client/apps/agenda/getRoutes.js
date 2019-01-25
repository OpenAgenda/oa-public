import React from 'react';
import { AgendaApp, AgendaDashboard } from '../../containers';

export default function ( prefix = '' ) {
  return [
    {
      component: AgendaApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: AgendaDashboard },
        { path: `${prefix}/activities`, component: AgendaDashboard },
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
