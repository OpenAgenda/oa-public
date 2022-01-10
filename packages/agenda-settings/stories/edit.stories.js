import React from 'react';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import EditDecorator from './decorators/EditDecorator';
import createApp from '../src/client/editApp';

import '@openagenda/bs-templates/compiled/main.css';

const agenda = {
  uid: 17026855,
  slug: 'proces-d-assises-2016',
  title: 'Proces d\'assices 2016',
  settings: {},
  credentials: {}
};

const getDefaultState = () => ({
  settings: {
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

export default {
  title: 'Edit',
  decorators: [EditDecorator]
};

export const GettingStarted = () => wrapApp(createApp({
  history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/getting-started`] }),
  initialState: getDefaultState()
}), wrapAppOptions);

export const Profile = () => wrapApp(createApp({
  history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/settings/profile`] }),
  initialState: getDefaultState()
}), wrapAppOptions);

export const Contribution = () => wrapApp(createApp({
  history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/settings/profile`] }),
  initialState: getDefaultState()
}), wrapAppOptions);

export const Advanced = () => wrapApp(createApp({
  history: createMemoryHistory({ initialEntries: [`/${agenda.slug}/admin/settings/advanced`] }),
  initialState: getDefaultState()
}), wrapAppOptions);
