import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/home',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/:uid/list'
    }
  }
};

export default function ( options ) {
  const {
    initialState,
    layout,
    req
  } = _.merge( {}, defaults, options );

  const { apiRoot, prefix } = initialState.settings;

  return createApp( {
    history: options.history,
    initialState,
    layout,
    req,
    apiRoot,
    prefix,
    getRoutes
  } );
};
