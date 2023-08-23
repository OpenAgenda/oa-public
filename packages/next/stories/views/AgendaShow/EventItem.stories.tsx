import { Container } from '@openagenda/uikit';
import { FiltersProvider } from '@openagenda/react-filters';
import Providers from 'Providers';
import AgendaShow from 'views/AgendaShow';
import EventItem from 'views/AgendaShow/components/EventItem';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import offlineEvent from '../../fixtures/events/offline.json';
import onlineEvent from '../../fixtures/events/online.json';
import mixedEvent from '../../fixtures/events/mixed.json';
import withoutImageEvent from '../../fixtures/events/withoutImage.json';
import featuredEvent from '../../fixtures/events/featured.json';

export default {
  title: 'views/AgendaShow/EventItem',
  component: EventItem,
  loaders: [
    async () => ({
      intlMessages: await AgendaShow.fetchLocale('fr'),
    }),
  ],
};

function Wrapper({ children }) {
  return (
    <DateFnsLocaleProvider>
      <FiltersProvider>
        <Container maxW="container.md">
          {children}
        </Container>
      </FiltersProvider>
    </DateFnsLocaleProvider>
  );
}

export function Offline(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem agenda={agendaFixtures} event={offlineEvent} />
      </Wrapper>
    </Providers>
  );
}

export function Online(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem agenda={agendaFixtures} event={onlineEvent} />
      </Wrapper>
    </Providers>
  );
}

export function Mixed(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem agenda={agendaFixtures} event={mixedEvent} />
      </Wrapper>
    </Providers>
  );
}

export function WithoutImage(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem agenda={agendaFixtures} event={withoutImageEvent} />
      </Wrapper>
    </Providers>
  );
}

export function Featured(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem agenda={agendaFixtures} event={featuredEvent} />
      </Wrapper>
    </Providers>
  );
}
