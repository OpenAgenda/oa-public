import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import createApp from '../src/client/app';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ( { lang = 'fr', apiRoot } = {} ) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
    perPageLimit: 20,
    isNew: false,
    displayLegacyMessageTab: false,
    userId: 2,
    userUid: 99999999
  },
  res: {
    agendas: {
      contribute: '/:slug/contribute',
      create: '/new',
      list: '/agendas.json',
      show: '/:slug',
      showPrivate: '/:slug.prv',
      addEvent: '/:slug/addevent',
      moderate: '/:slug/admin'
    },
    events: {
      list: '/events.json',
      show: '/:slug/events/:eventSlug',
      showPrivate: '/:slug/events/:eventSlug.prv',
      showWithoutAgenda: '/events/:eventSlug'
    },
    messages: '/home/messages',
    notifs: '/home/notifications',
    moderate: '/:slug/admin',
    search: '/agendas'
  },
  menu: {
    tab: 'agendas'
  }
});


storiesOf( 'App', module )
  .add( 'all', () => wrapApp( createApp( {
    history: createMemoryHistory(),
    initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
  } ) ) )
  .add( 'with search query', () => wrapApp( createApp( {
    history: createMemoryHistory( { initialEntries: [ '/?search=Paris' ] } ),
    initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
  } ) ) );
