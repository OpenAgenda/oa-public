import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      lang: 'fr',
      apiRoot: 'http://localhost:3000'
    },
    res: {
      list: '/agendas',
      create: '/new',
      events: '/home/events',
      messages: '/home/messages',
      notifs: '/home/notifications',
      moderate: '/:slug/admin',
      show: '/:slug',
      showPrivate: '/:slug.prv',
      addEvent: '/:slug/addevent',
      search: '/agendas'
    },
    menu: {},
    agendas: {}
  }
};

export default function ( options ) {
  const {
    initialState,
    Header,
    req
  } = _.merge( {}, defaults, options );

  const { apiRoot, prefix, rootPrefix } = initialState.settings;

  return createApp( {
    history: options.history,
    initialState,
    Header,
    req,
    apiRoot,
    prefix,
    getRoutes: () => getRoutes( prefix, rootPrefix )
  } );
}
