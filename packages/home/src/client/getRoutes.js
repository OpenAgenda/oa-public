import React from 'react';
import { App, Agendas, Events } from './containers';

export default function ( prefix = '' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Agendas },
        { path: `${prefix}/events`, component: Events },
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
