import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import createApp from '../src/app';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ({ lang = 'fr', apiRoot } = {}) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
    perPageLimit: 20
  },
  res: {
    app: '#',
    list: '/members.json',
    update: '/update/:id',
    remove: '/remove/:id',
    invite: '/invite',
    stats: '/stats',
    showContributor: '#',
    writeToMember: '#', // old chat
    sendMessage: '/send-message',
    sendAMessage: '/send-a-message/:id'
  },
  agenda: {
    title: '[Archives] Rendez-vous aux Jardins 2016 [Officiel]',
    slug: 'rdj2016',
    uid: 62792452,
    ownerId: 2,
    credentials: {
      moderators: false,
      tags: false,
      embedsHead: false,
      embedsTemplates: false
    },
    roles: [
      {
        code: 1,
        slug: 'contributor'
      },
      {
        code: 2,
        slug: 'administrator'
      }
    ]
  },
  member: {
    actionsCounter: 0,
    createdAt: '2015-12-08T16:30:34.000Z',
    role: 2,
    custom: {
      contactName: 'Romain Lange - OpenAgenda'
    },
    deletedUser: false,
    id: 6478,
    linkStore: null,
    updatedAt: '2015-12-08T16:30:34.000Z'
  }
});

storiesOf('App', module)
  .addDecorator(PageDecorator)
  .add('all', () => {
    const { element, triggerHooks } = createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState({
        apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`
      })
    });

    triggerHooks();

    return element;
  });
