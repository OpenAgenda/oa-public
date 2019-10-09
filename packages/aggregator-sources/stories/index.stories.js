import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import createApp from '../src/client/app';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ( { lang = 'fr', apiRoot } = {} ) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
    perPageLimit: 20,
  },
  res: {
    list: '/sources.json',
    show: '#',
    remove: '/remove',
    search: '#',
    createAggregator: '#'
  },
  agenda: {
    uid: 48959239,
    slug: 'la-gargouille',
    title: 'La gargouille',
    isAggregator: true
  }
});


storiesOf( 'App', module )
  .addDecorator( PageDecorator )
  .add( 'all', () => {
    const { element } = createApp( {
      history: createMemoryHistory(),
      initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
    } );

    return element;
  } );
