import { rest } from 'msw';
import Providers from 'Providers';
import AggregateModal from 'views/AgendaShow/components/AggregateModal';
import ContextBar from 'views/AgendaShow/components/ContextBar';
import AgendaShow from 'views/AgendaShow';
import agendaFixtures from '../../fixtures/mel.agenda.json';

export default {
  title: 'views/AgendaShow/ContextBar',
  component: AggregateModal,
  loaders: [
    async () => ({
      intlMessages: await AgendaShow.fetchLocale('fr'),
    }),
  ],
};

export function Contributor(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <ContextBar agenda={agendaFixtures} />
    </Providers>
  );
}

Contributor.parameters = {
  msw: {
    handlers: [
      rest.get('/api/me/agendas/:agendaUid', (req, res, ctx) => res(ctx.json({
        me: {
          member: {
            role: 'contributor',
          },
          events: {
            states: [],
          },
        },
      }))),
    ],
  },
};

export function ContributorWithDrafts(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <ContextBar agenda={agendaFixtures} />
    </Providers>
  );
}

ContributorWithDrafts.parameters = {
  msw: {
    handlers: [
      rest.get('/api/me/agendas/:agendaUid', (req, res, ctx) => res(ctx.json({
        me: {
          member: {
            role: 'contributor',
          },
          events: {
            states: [{
              key: -1,
              eventCount: 2,
            }, {
              key: 0,
              eventCount: 4,
            }, {
              key: 1,
              eventCount: 6,
            }, {
              key: 2,
              eventCount: 8,
            }],
            drafts: 8,
          },
        },
      }))),
      rest.get('/api/me/agendas/:agendaUid/events/drafts', (req, res, ctx) => res(ctx.json({
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
      }))),
      rest.get('/api/me/agendas/:agendaUid/events', (req, res, ctx) => res(ctx.json({
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
      }))),
    ],
  },
};

export function Moderators(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <ContextBar agenda={agendaFixtures} />
    </Providers>
  );
}

Moderators.parameters = {
  msw: {
    handlers: [
      rest.get('/api/me/agendas/:agendaUid', (req, res, ctx) => res(ctx.json({
        me: {
          member: {
            role: 'moderator',
          },
          events: {},
        },
        events: {
          states: [{
            key: -1,
            eventCount: 2,
          }, {
            key: 0,
            eventCount: 4,
          }, {
            key: 1,
            eventCount: 6,
          }, {
            key: 2,
            eventCount: 8,
          }],
          drafts: 8,
        },
      }))),
      rest.get('/api/me/agendas/:agendaUid/events', (req, res, ctx) => res(ctx.json({
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
      }))),
    ],
  },
};
