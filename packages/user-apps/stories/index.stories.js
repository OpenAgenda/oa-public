import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import createApp from '../src/app';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ( { apiRoot } = {} ) => ({
  settings: {
    apiRoot,
    prefix: ''
  },
  res: {
    getMe: '/users/me',
    updateProfile: '/users/me',
    deleteAccount: '/users/me',
    changeEmail: '/users/me/requestChangeEmail',
    changePassword: '/users/me/changePassword',
    generateApiKey: '/users/me/generateApiKey',
    uploadProfileImage: '/users/me/setImageProfile',
    removeProfileImage: '/users/me/clearImageProfile'
  }
});


storiesOf( 'App', module )
  .add( 'all', () => wrapApp( createApp( {
    history: createMemoryHistory(),
    initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
  } ), {
    extraProps: {
      user: {
        id: 1,
        uid: 75052324
      },
      lang: 'fr'
    }
  } ) );
