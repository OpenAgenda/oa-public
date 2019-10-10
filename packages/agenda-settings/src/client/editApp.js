import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './editRoutes';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/agendaSettings/edit',
      apiRoot: `localhost:${process.env.PORT || 3000}`
    },
    res: {
      get: '/agendas/:uid/admin/settings.json',
      slugAvailable: '/agendas/slugs/available',
      set: '/:slug/admin/settings/edit',
      uploadImage: '/:slug/admin/settings/setImage',
      clearImage: '/:slug/admin/settings/clearImage',
      remove: '/:slug/admin/settings/remove'
    },
    agenda: {
      uid: '17026855'
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
