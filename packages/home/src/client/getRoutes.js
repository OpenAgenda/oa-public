import React from 'react';
import loadable from '@loadable/component';
import NotFound from '@openagenda/react-utils/dist/NotFound';
import { App, /* Agendas, Events */ } from './containers';

const Agendas = loadable( () => import( './containers/Agendas' ) );
const Events = loadable( () => import( './containers/Events' ) );

export default function ( prefix = '', notFoundkey = 'home' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Agendas },
        { path: `${prefix}/events`, component: Events },
        { component: NotFound, notFoundkey }
      ]
    }
  ];
};
