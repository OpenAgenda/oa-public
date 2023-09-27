import { rest } from 'msw';
import AgendaShow from 'pages/[agendaSlug]';
import AgendaShowView from 'views/AgendaShow';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from './fixtures/events.json';

export default {
  title: 'pages/[agendaSlug]/index',
  component: AgendaShow,
  loaders: [
    intlMessagesLoader(AgendaShowView.fetchLocale),
  ],
  decorators: [
    ProvidersDecorator,
  ],
};

export const Sample = {
  render: (_args, { loaded: { intlMessages } }) => (
    <AgendaShow.Layout>
      <AgendaShow
        intlMessages={intlMessages}
        agenda={agendaFixtures}
      />
    </AgendaShow.Layout>
  ),
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/agendas/slug/metropole-europeenne-de-lille/events', (req, res, ctx) => res(
          ctx.json(eventsFixtures),
        )),
      ],
    },
  },
};
