import React from 'react';
import { App, Agendas, Events } from './containers';

export default function getRoutes( prefix = '' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Agendas },
        { path: `${prefix}/events`, component: Events },
        { component: props => <pre>{JSON.stringify( props, null, 2 )}</pre> }
      ]
    }
  ];
};
