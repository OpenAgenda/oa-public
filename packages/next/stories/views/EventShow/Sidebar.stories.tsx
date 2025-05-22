import { useRouter } from 'next/router';
import { SWRConfig } from 'swr';
import { subHours, addHours, startOfHour } from 'date-fns';
import { http, HttpResponse } from 'msw';
import { Container } from '@openagenda/uikit';
import EventShow from 'views/EventShow';
import Sidebar from 'views/EventShow/components/Sidebar';
import { AgendaProvider } from 'views/EventShow/contexts/agenda';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventFixtures from '../../fixtures/events/sample.json';
import onlineEventFixtures from '../../fixtures/events/online.json';
import passCultureEventFixtures from '../../fixtures/events/passCulture.json';
import timezonedEventFixtures from '../../fixtures/events/timezoned.json';

export default {
  title: 'views/EventShow/Sidebar',
  component: Sidebar,
  loaders: [intlMessagesLoader(EventShow.fetchLocale)],
  decorators: [
    (Story) => (
      <Container maxW="md">
        <Story />
      </Container>
    ),
    ProvidersDecorator,
  ],
};

function Fixtures({ event, children }) {
  const router = useRouter();
  router.query.agendaSlug = agendaFixtures.slug;
  router.query.eventSlug = event.slug;

  return (
    <AgendaProvider agenda={agendaFixtures}>
      <SWRConfig
        value={{
          fallback: {
            [`/api/agendas/slug/${agendaFixtures.slug}/events/slug/${event.slug}?longDescriptionFormat=HTMLWithEmbeds`]:
              {
                success: true,
                event,
              },
          },
        }}
      >
        {children}
      </SWRConfig>
    </AgendaProvider>
  );
}

export function Simple() {
  return (
    <Fixtures event={eventFixtures}>
      <Sidebar />
    </Fixtures>
  );
}

export function Private() {
  return (
    <Fixtures event={{ ...eventFixtures, private: true }}>
      <Sidebar />
    </Fixtures>
  );
}

export function Past() {
  const now = new Date();
  const timings = [
    {
      begin: startOfHour(subHours(now, 2)),
      end: startOfHour(subHours(now, 1)),
    },
  ];

  return (
    <Fixtures
      event={{
        ...eventFixtures,
        timings,
        lastTiming: timings[0],
        nextTiming: null,
      }}
    >
      <Sidebar />
    </Fixtures>
  );
}

export function Future() {
  const now = new Date();
  const timings = [
    {
      begin: startOfHour(addHours(now, 1)).toISOString(),
      end: startOfHour(addHours(now, 2)).toISOString(),
    },
  ];

  return (
    <Fixtures
      event={{
        ...eventFixtures,
        timings,
        lastTiming: timings[0],
        nextTiming: timings[0],
      }}
    >
      <Sidebar />
    </Fixtures>
  );
}

export function Online() {
  return (
    <Fixtures event={onlineEventFixtures}>
      <Sidebar />
    </Fixtures>
  );
}

export function PassCulture() {
  return (
    <Fixtures event={passCultureEventFixtures}>
      <Sidebar isEventContributor={true} />
    </Fixtures>
  );
}

PassCulture.parameters = {
  msw: {
    handlers: [
      http.get('/api/agendas/*/events/*/passCulture/bookings', () => {
        return HttpResponse.json(
          require('../../components/fixtures/passBookings.json'),
        );
      }),
    ],
  },
};

export function Timezoned() {
  return (
    <Fixtures event={timezonedEventFixtures}>
      <Sidebar />
    </Fixtures>
  );
}
