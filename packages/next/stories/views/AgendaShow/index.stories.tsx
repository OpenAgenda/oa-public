import Providers from 'Providers';
import AgendaShow from 'views/AgendaShow';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from '../../fixtures/mel.events.json';

export default {
  title: 'AgendaShow',
  component: AgendaShow,
  loaders: [
    async () => ({
      intlMessages: await AgendaShow.fetchLocale('fr'),
    }),
  ],
};

export function Sample(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <AgendaShow agenda={agendaFixtures} eventsProps={eventsFixtures} />
    </Providers>
  );
}
