import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getReducers from './redux/reducer';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      lang: 'fr',
      apiRoot: 'http://localhost:3000'
    },
    userSettings: {
      user: {},
      modal: {},
      successMessagesDisplayed: {}
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
    getReducers,
    getRoutes
  } );
}
