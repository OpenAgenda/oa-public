import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
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
  }
});

const wrapAppOptions = {
  extraProps: {
    agenda: {
      uid: 17026855,
      slug: 'proces-d-assises-2016',
      title: 'Proces d\'assices 2016'
    }
  }
};

storiesOf( 'Edit', module )
  .addDecorator( EditDecorator )
  .add( 'settings', () => wrapApp( createApp( {
    history: createMemoryHistory(),
    initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
  } ), wrapAppOptions ) )
  .add( 'contribution', () => wrapApp( createApp( {
    history: createMemoryHistory( { initialEntries: [ '/contribution' ] } ),
    initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
  } ), wrapAppOptions ) )
  .add( 'advanced', () => wrapApp( createApp( {
    history: createMemoryHistory( { initialEntries: [ '/advanced' ] } ),
    initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
  } ), wrapAppOptions ) );
