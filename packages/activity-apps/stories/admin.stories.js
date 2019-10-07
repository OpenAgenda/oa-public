import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import createApp from '../src/client/apps/admin';

import '@openagenda/bs-templates/compiled/admin.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ( { lang = 'fr', apiRoot } = {} ) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
    perPageLimit: 20,
  },
  res: {
    list: '/agenda/list'
  },
  agenda: {
    uid: 48959239,
    slug: 'la-gargouille',
    title: 'La gargouille',
    isAggregator: true
  }
});


storiesOf( 'Admin', module )
  .add( 'app', () => {
    const { element } = createApp( {
      history: createMemoryHistory(),
      initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
    } );

    return element;
  } );
