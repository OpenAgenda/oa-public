import { http, HttpResponse } from 'msw';
import ContextBar from 'views/AgendaShow/components/ContextBar';
import AgendaShow from 'views/AgendaShow';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';

export default {
  title: 'views/AgendaShow/ContextBar',
  component: ContextBar,
  loaders: [intlMessagesLoader(AgendaShow.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const Contributor = {
  render: () => <ContextBar agenda={agendaFixtures} />,
  parameters: {
    msw: {
      handlers: [
        http.get('/api/me/agendas/:agendaUid', () =>
          HttpResponse.json({
            me: {
              member: {
                role: 'contributor',
              },
              events: {
                states: [],
              },
            },
          })),
      ],
    },
  },
};

export const ContributorWithDrafts = {
  render: () => <ContextBar agenda={agendaFixtures} />,
  parameters: {
    msw: {
      handlers: [
        http.get('/api/me/agendas/:agendaUid', () =>
          HttpResponse.json({
            me: {
              member: {
                role: 'contributor',
              },
              events: {
                states: [
                  {
                    key: -1,
                    eventCount: 2,
                  },
                  {
                    key: 0,
                    eventCount: 4,
                  },
                  {
                    key: 1,
                    eventCount: 6,
                  },
                  {
                    key: 2,
                    eventCount: 8,
                  },
                ],
                drafts: 8,
              },
            },
          })),
        http.get('/api/me/agendas/:agendaUid/events/drafts', () =>
          HttpResponse.json({
            events: [
              {
                uid: 1,
                slug: 'test',
                title: 'Test',
                draft: true,
              },
              {
                uid: 2,
                slug: 'test-2',
                title: 'Test 2',
                description: 'Un test',
                draft: true,
              },
            ],
          })),
        http.get('/api/me/agendas/:agendaUid/events', () =>
          HttpResponse.json({
            events: [
              {
                uid: 1,
                slug: 'test',
                title: 'Test',
                description: 'Un test',
              },
              {
                uid: 2,
                slug: 'test-2',
                title: 'Test 2',
                description: 'Un test',
              },
            ],
          })),
      ],
    },
  },
};

export const Moderators = {
  render: () => <ContextBar agenda={agendaFixtures} />,
  parameters: {
    msw: {
      handlers: [
        http.get('/api/me/agendas/:agendaUid', () =>
          HttpResponse.json({
            me: {
              member: {
                role: 'moderator',
              },
              events: {},
            },
            events: {
              states: [
                {
                  key: -1,
                  eventCount: 2,
                },
                {
                  key: 0,
                  eventCount: 4,
                },
                {
                  key: 1,
                  eventCount: 6,
                },
                {
                  key: 2,
                  eventCount: 8,
                },
              ],
              drafts: 8,
            },
          })),
        http.get('/api/me/agendas/:agendaUid/events', () =>
          HttpResponse.json({
            events: [
              {
                uid: 1,
                slug: 'test',
                title: 'Test',
                draft: true,
              },
              {
                uid: 2,
                slug: 'test-2',
                title: 'Test 2',
                description: 'Un test',
                draft: true,
              },
            ],
          })),
      ],
    },
  },
};

export const Visibility = {
  render: () => <ContextBar agenda={{ ...agendaFixtures, private: 1 }} />,
  parameters: {
    msw: {
      handlers: [
        http.get('/api/me/agendas/:agendaUid', () =>
          HttpResponse.json({
            me: {
              member: {
                role: 'moderator',
              },
              events: {},
            },
          })),
      ],
    },
  },
};
