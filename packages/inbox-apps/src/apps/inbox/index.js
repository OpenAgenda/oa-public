import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from '../../getRoutes';
import getReducers from '../../redux/reducer';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/inboxes/user',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
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
    getRoutes,
    getReducers
  } );
}
