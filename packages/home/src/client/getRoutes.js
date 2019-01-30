import React from 'react';
import NotFound from '@openagenda/react-utils/dist/NotFound';
import { App, Agendas, Events } from './containers';

export default function ( prefix = '' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Agendas },
        { path: `${prefix}/events`, component: Events },
        { component: NotFound }
      ]
    }
  ];
};
