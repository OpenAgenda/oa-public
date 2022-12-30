import { Container } from '@openagenda/uikit';
import Providers from 'Providers';
import AgendaShow from 'views/AgendaShow';
import EventItem from 'views/AgendaShow/components/EventItem';
import offlineEvent from '../../fixtures/events/offline.json';
import onlineEvent from '../../fixtures/events/online.json';
import mixedEvent from '../../fixtures/events/mixed.json';
import withoutImageEvent from '../../fixtures/events/withoutImage.json';
import featuredEvent from '../../fixtures/events/featured.json';

export default {
  title: 'EventItem',
  component: EventItem,
  loaders: [
    async () => ({
      intlMessages: await AgendaShow.fetchLocale('fr'),
    }),
  ],
};

function Wrapper({ children }) {
  return (
    <Container maxW="container.md">
      {children}
    </Container>
  );
}

export function Offline(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem event={offlineEvent} />
      </Wrapper>
    </Providers>
  );
}

export function Online(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem event={onlineEvent} />
      </Wrapper>
    </Providers>
  );
}

export function Mixed(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem event={mixedEvent} />
      </Wrapper>
    </Providers>
  );
}

export function WithoutImage(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem event={withoutImageEvent} />
      </Wrapper>
    </Providers>
  );
}

export function Featured(_args, { loaded: { intlMessages } }) {
  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      <Wrapper>
        <EventItem event={featuredEvent} />
      </Wrapper>
    </Providers>
  );
}
