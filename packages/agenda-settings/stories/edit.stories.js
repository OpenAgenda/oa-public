import _ from 'lodash';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/editApp.js';
import EditDecorator from './decorators/EditDecorator.js';

import '@openagenda/bs-templates/compiled/main.css';

import agenda from './fixtures/bdm.agenda.json' with { type: 'json' };

const getDefaultState = () => ({
  settings: {
    prefix: '/:slug/admin',
  },
  res: {
    agenda: '/:slug',
    addEvent: '/:slug/contribute',
    createEmbed: '/:slug/admin/embeds',
    delete: '/:uid',
    get: '/:uid/agenda.json',
    set: '/:slug/edit',
    slugAvailable: '/slugs/available',
    remove: '/:slug/remove',
    keys: {
      create: '/:slug/keys/create',
      list: '/:slug/keys/list',
      update: '/:slug/keys/update',
      remove: '/:slug/keys/remove',
    },
  },
  agenda: {},
  modals: {},
  form: {},
});

const wrapAppOptions = {
  extraProps: {
    agenda: _.omit(agenda, ['schema']),
    lang: 'fr',
    agendaSchema: agenda.schema,
  },
};

export default {
  title: 'Edit',
  decorators: [EditDecorator],
};

export const GettingStarted = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: [`/${agenda.slug}/admin/getting-started`],
      }),
      initialState: getDefaultState(),
    }),
    wrapAppOptions,
  );

export const Profile = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: [`/${agenda.slug}/admin/settings/profile`],
      }),
      initialState: getDefaultState(),
    }),
    wrapAppOptions,
  );

export const Contribution = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: [`/${agenda.slug}/admin/settings/contribution`],
      }),
      initialState: getDefaultState(),
    }),
    wrapAppOptions,
  );

export const Advanced = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: [`/${agenda.slug}/admin/settings/advanced`],
      }),
      initialState: getDefaultState(),
    }),
    wrapAppOptions,
  );
