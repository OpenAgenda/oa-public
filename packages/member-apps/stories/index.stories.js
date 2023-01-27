import '@openagenda/bs-templates/compiled/main.css';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';
import PageDecorator from './decorators/PageDecorator';
import Providers from './decorators/Providers';

const getDefaultState = () => ({
  settings: {
    prefix: '',
    perPageLimit: 20,
  },
  res: {
    app: '#',
    list: '/members.json',
    get: '/api/agendas/:agendaUid/members/:userUid',
    update: '/api/agendas/:agendaUid/members/:userUid',
    remove: '/api/agendas/:agendaUid/members/:userUid',
    invite: '/invite',
    stats: '/stats',
    showContributor: '#',
    writeToMember: '#', // old chat
    sendMessage: '/send-message',
    resend: '/:slug/admin/members/:id/invite/resend',
    exportToCsv: '/:slug/admin/members.csv',
    exportToXlsx: '/:slug/admin/members.xlsx',
    getSchema: '/api/agenda/:agendaUid/settings/memberSchema',
  },
  members: {},
  modals: {},
});

export default {
  title: 'Members admin',
  decorators: [Providers, PageDecorator],
};

export const App = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        user: {
          uid: 99999999,
          isNew: false,
        },
        lang: 'fr',
        agenda: {
          title: '[Archives] Rendez-vous aux Jardins 2016 [Officiel]',
          slug: 'rdj2016',
          uid: 62792452,
          ownerId: 2,
          credentials: {
            moderators: false,
            embedsHead: false,
            embedsTemplates: false,
            invitationMessage: true,
          },
          roles: [
            {
              code: 1,
              slug: 'contributor',
            },
            {
              code: 2,
              slug: 'administrator',
            },
          ],
        },
        member: {
          actionsCounter: 0,
          createdAt: '2015-12-08T16:30:34.000Z',
          role: 2,
          custom: {
            contactName: 'Romain Lange - OpenAgenda',
          },
          deletedUser: false,
          id: 6478,
          linkStore: null,
          updatedAt: '2015-12-08T16:30:34.000Z',
        },
      },
    },
  );
