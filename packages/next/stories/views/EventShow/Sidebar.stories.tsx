import { subHours, addHours, startOfHour } from 'date-fns';
import { Container } from '@openagenda/uikit';
import EventShow from 'views/EventShow';
import Sidebar from 'views/EventShow/components/Sidebar';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import eventFixtures from '../../fixtures/events/sample.json';
import onlineEventFixtures from '../../fixtures/events/online.json';

export default {
  title: 'views/EventShow/Sidebar',
  component: Sidebar,
  loaders: [
    intlMessagesLoader(EventShow.fetchLocale),
  ],
  decorators: [
    Story => (
      <Container maxW="md">
        <Story />
      </Container>
    ),
    ProvidersDecorator,
  ],
};

export function Simple() {
  return <Sidebar event={eventFixtures} />;
}

export function Private() {
  return <Sidebar event={{ ...eventFixtures, private: true }} />;
}

export function Past() {
  const now = new Date();
  const timings = [{
    begin: startOfHour(subHours(now, 2)),
    end: startOfHour(subHours(now, 1)),
  }];

  return (
    <Sidebar
      event={{
        ...eventFixtures,
        timings,
        lastTiming: timings[0],
        nextTiming: null,
      }}
    />
  );
}

export function Future() {
  const now = new Date();
  const timings = [{
    begin: startOfHour(addHours(now, 1)),
    end: startOfHour(addHours(now, 2)),
  }];

  return (
    <Sidebar
      event={{
        ...eventFixtures,
        timings,
        lastTiming: timings[0],
        nextTiming: timings[0],
      }}
    />
  );
}

export function Online() {
  return <Sidebar event={onlineEventFixtures} />;
}
