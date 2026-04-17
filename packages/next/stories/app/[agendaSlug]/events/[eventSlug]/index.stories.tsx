import EventShowWrapper from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/EventShowWrapper';
import AppLayout from 'components/app/Layout';
import { Agenda } from 'types';
import intlMessagesLoader from '../../../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../../../decorators/ProvidersDecorator';
import fetchLocale from '../../../../utils/fetchLocale';
import eventFixtures from '../../../../fixtures/events/sample.json';
import agendaFixtures from './fixtures/agenda.fake.json';
import agendaJEPFixtures from './fixtures/agenda.jep-2023-grand-est.json';
import eventJEPFixtures from './fixtures/event.jep-2023-grand-est.json';
import agendaNantesFixtures from './fixtures/agenda.nantes.json';
import eventNantesFixtures from './fixtures/event.nantes.json';

const eventKey = (agenda: { slug: string }, event: { slug: string }) =>
  `/api/agendas/slug/${agenda.slug}/events/slug/${event.slug}?longDescriptionFormat=HTMLWithEmbeds`;

const navigationFor = (agenda: { slug: string }, event: { slug: string }) => ({
  pathname: `/fr/${agenda.slug}/events/${event.slug}`,
  segments: [
    ['locale', 'fr'],
    ['agendaSlug', agenda.slug],
    ['eventSlug', event.slug],
  ],
});

export default {
  title: 'app/[agendaSlug]/events/[eventSlug]',
  component: EventShowWrapper,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export const Sample = {
  render: () => (
    <AppLayout>
      <EventShowWrapper
        agenda={agendaFixtures as Agenda}
        eventFallbackKey={eventKey(agendaFixtures, eventFixtures)}
        eventFallback={{ success: true, event: eventFixtures }}
      />
    </AppLayout>
  ),
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: navigationFor(agendaFixtures, eventFixtures),
    },
  },
};

export const JEP2023 = {
  render: () => (
    <AppLayout>
      <EventShowWrapper
        agenda={agendaJEPFixtures as Agenda}
        eventFallbackKey={eventKey(agendaJEPFixtures, eventJEPFixtures)}
        eventFallback={{ success: true, event: eventJEPFixtures }}
      />
    </AppLayout>
  ),
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: navigationFor(agendaJEPFixtures, eventJEPFixtures),
    },
  },
};

export const WithNavigation = {
  render: () => (
    <AppLayout>
      <EventShowWrapper
        agenda={agendaNantesFixtures as Agenda}
        eventFallbackKey={eventKey(agendaNantesFixtures, eventNantesFixtures)}
        eventFallback={{ success: true, event: eventNantesFixtures }}
      />
    </AppLayout>
  ),
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: navigationFor(agendaNantesFixtures, eventNantesFixtures),
    },
  },
  decorators: [
    (Story) => {
      const originalGetItem = Storage.prototype.getItem;

      Storage.prototype.getItem = function (key) {
        if (key === 'EventShow:nc') {
          return JSON.stringify({
            [`${agendaNantesFixtures.uid}.${eventNantesFixtures.uid}`]: {
              from: 0,
              first: false,
              last: false,
            },
          });
        }
        return originalGetItem.call(this, key);
      };

      Storage.prototype.setItem = function () {};

      return <Story />;
    },
  ],
};
