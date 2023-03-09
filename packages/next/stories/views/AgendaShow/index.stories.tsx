import { SWRConfig, unstable_serialize as unstableSerialize } from 'swr';
import Providers from 'Providers';
import AgendaShow from 'views/AgendaShow';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import filtersBaseFixtures from './fixtures/filtersBase.json';
import eventsFixtures from './fixtures/events.json';

export default {
  title: 'AgendaShow/index',
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
      <DateFnsLocaleProvider locale="fr">
        <SWRConfig
          value={{
            fallback: {
              [unstableSerialize(['agendaShow', 'filtersBase', agendaFixtures.slug])]: filtersBaseFixtures,
              [`$inf$${unstableSerialize(['agendaShow', 'events', agendaFixtures.slug, {}])}`]: [eventsFixtures],
            },
          }}
        >
          <AgendaShow agenda={agendaFixtures} />
        </SWRConfig>
      </DateFnsLocaleProvider>
    </Providers>
  );
}
