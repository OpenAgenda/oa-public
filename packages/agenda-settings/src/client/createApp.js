import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './createRoutes';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/new'
    },
    res: {
      create: '/new',
      slugAvailable: '/agendas/slugs/available',
      onCreated: '/:slug/admin/settings/gettingStarted'
    }
  }
};

export default function ( options ) {
  const {
    initialState,
    Header,
    req
  } = _.merge( {}, defaults, options );

  const { apiRoot, prefix } = initialState.settings;

  return createApp( {
    history: options.history,
    initialState,
    Header,
    req,
    apiRoot,
    prefix,
    getRoutes
  } );
}
