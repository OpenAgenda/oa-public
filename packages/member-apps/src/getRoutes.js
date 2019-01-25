import React from 'react';
import { App, Dashboard } from './containers';

export default function ( prefix = '' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Dashboard },
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
