import { Container } from '@openagenda/uikit';
import { FiltersProvider } from '@openagenda/react-filters';
import AgendaShow from 'views/AgendaShow';
import EventItem from 'views/AgendaShow/components/EventItem';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import offlineEvent from '../../fixtures/events/offline.json';
import onlineEvent from '../../fixtures/events/online.json';
import mixedEvent from '../../fixtures/events/mixed.json';
import withALongTitle from '../../fixtures/events/withALongTitle.json';
import cancelledEvent from '../../fixtures/events/cancelled.json';
import withoutImageEvent from '../../fixtures/events/withoutImage.json';
import featuredEvent from '../../fixtures/events/featured.json';

export default {
  title: 'views/AgendaShow/EventItem',
  component: EventItem,
  loaders: [
    intlMessagesLoader(AgendaShow.fetchLocale),
  ],
  decorators: [
    Story => (
      <FiltersProvider>
        <Container maxW="container.md">
          <Story />
        </Container>
      </FiltersProvider>
    ),
    ProvidersDecorator,
  ],
};

export function Offline() {
  return <EventItem agenda={agendaFixtures} event={offlineEvent} />;
}

export function Online() {
  return <EventItem agenda={agendaFixtures} event={onlineEvent} />;
}

export function Mixed() {
  return <EventItem agenda={agendaFixtures} event={mixedEvent} />;
}

export function WithoutImage() {
  return <EventItem agenda={agendaFixtures} event={withoutImageEvent} />;
}

export function WithALongTitle() {
  return <EventItem agenda={agendaFixtures} event={withALongTitle} />;
}

export function Featured() {
  return <EventItem agenda={agendaFixtures} event={featuredEvent} />;
}

export function Cancelled() {
  return <EventItem agenda={agendaFixtures} event={cancelledEvent} />;
}

export function RescheduledWithALongTitle() {
  return (
    <EventItem
      agenda={agendaFixtures}
      event={{
        ...withALongTitle,
        status: 2,
      }}
    />
  );
}
