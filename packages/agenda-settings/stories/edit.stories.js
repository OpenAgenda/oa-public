import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import EditDecorator from './decorators/EditDecorator';
import createApp from '../src/client/editApp';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ( { lang = 'fr', apiRoot } = {} ) => ({
  settings: {
    lang,
    apiRoot,
    prefix: ''
  },
  res: {
    get: '/:uid/agenda.json',
    set: '/:slug/edit',
    slugAvailable: '/slugs/available',
    uploadImage: `${apiRoot}/:slug/setImage`,
    clearImage: `${apiRoot}/:slug/clearImage`,
    remove: '/:slug/remove',
    keys: {
      create: '/:slug/keys/create',
      list: '/:slug/keys/list',
      update: '/:slug/keys/update',
      remove: '/:slug/keys/remove'
    }
  },
  agenda: {
    loading: true,
    uid: 17026855,
    slug: 'proces-d-assises-2016'
  }
});


storiesOf( 'Edit', module )
  .addDecorator( EditDecorator )
  .add( 'settings', () => {
    const { element } = createApp( {
      history: createMemoryHistory(),
      initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
    } );

    return element;
  } )
  .add( 'contribution', () => {
    const { element } = createApp( {
      history: createMemoryHistory( { initialEntries: [ '/contribution' ] } ),
      initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
    } );

    return element;
  } )
  .add( 'advanced', () => {
    const { element } = createApp( {
      history: createMemoryHistory( { initialEntries: [ '/advanced' ] } ),
      initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
    } );

    return element;
  } );
