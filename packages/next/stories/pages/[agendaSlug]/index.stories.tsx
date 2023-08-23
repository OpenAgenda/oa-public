import { rest } from 'msw';
import Providers from 'Providers';
import AgendaShow from 'pages/[agendaSlug]';
import AgendaShowView from 'views/AgendaShow';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from './fixtures/events.json';

export default {
  title: 'pages/[agendaSlug]/index',
  component: AgendaShow,
  loaders: [
    async () => ({
      intlMessages: await AgendaShowView.fetchLocale('fr'),
    }),
  ],
};

export function Sample(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <AgendaShow.Layout>
        <AgendaShow
          intlMessages={intlMessages}
          agenda={agendaFixtures}
        />
      </AgendaShow.Layout>
    </Providers>
  );
}

Sample.parameters = {
  msw: {
    handlers: [
      rest.get('/api/agendas/slug/metropole-europeenne-de-lille/events', (req, res, ctx) => res(
        ctx.json(eventsFixtures),
      )),
    ],
  },
};
