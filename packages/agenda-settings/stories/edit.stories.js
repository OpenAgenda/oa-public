import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import EditDecorator from './decorators/EditDecorator';
import createApp from '../src/client/editApp';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const agenda = {
  uid: 17026855,
  slug: 'proces-d-assises-2016',
  title: 'Proces d\'assices 2016',
  settings: {},
  credentials: {}
};

const getDefaultState = ({ lang = 'fr', apiRoot } = {}) => ({
  settings: {
    lang,
    apiRoot,
    prefix: `/:slug/admin`
  },
  res: {
    agenda: '/:slug',
    addEvent: '/:slug/contribute',
    createEmbed: '/:slug/admin/webembed',
    get: '/:uid/agenda.json',
    set: '/:slug/edit',
    slugAvailable: '/slugs/available',
    remove: '/:slug/remove',
    keys: {
      create: '/:slug/keys/create',
      list: '/:slug/keys/list',
      update: '/:slug/keys/update',
      remove: '/:slug/keys/remove'
    }
  },
  agenda: {},
  modals: {},
  form: {}
});

const wrapAppOptions = {
  extraProps: {
    agenda
  }
};

storiesOf('Edit', module)
  .addDecorator(EditDecorator)
  .add('getting started', () => wrapApp(createApp({
    history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/getting-started`] }),
    initialState: getDefaultState({ apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` })
  }), wrapAppOptions))
  .add('profile', () => wrapApp(createApp({
    history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/settings/profile`] }),
    initialState: getDefaultState({ apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` })
  }), wrapAppOptions))
  .add('contribution', () => wrapApp(createApp({
    history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/settings/contribution`] }),
    initialState: getDefaultState({ apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` })
  }), wrapAppOptions))
  .add('advanced', () => wrapApp(createApp({
    history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/settings/advanced`] }),
    initialState: getDefaultState({ apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` })
  }), wrapAppOptions));
