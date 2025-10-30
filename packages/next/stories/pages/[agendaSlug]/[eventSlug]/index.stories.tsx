import EventShow from 'pages/[agendaSlug]/events/[eventSlug]';
import EventShowView from 'views/EventShow';
import { Agenda } from 'types';
import intlMessagesLoader from '../../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../../decorators/ProvidersDecorator';
import eventFixtures from '../../../fixtures/events/sample.json';
import agendaFixtures from './fixtures/agenda.fake.json';
import agendaJEPFixtures from './fixtures/agenda.jep-2023-grand-est.json';
import eventJEPFixtures from './fixtures/event.jep-2023-grand-est.json';
import agendaNantesFixtures from './fixtures/agenda.nantes.json';
import eventNantesFixtures from './fixtures/event.nantes.json';

export default {
  title: 'pages/[agendaSlug]/events/[eventSlug]',
  component: EventShow,
  loaders: [intlMessagesLoader(EventShowView.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const Sample = {
  render: (_args, { loaded: { intlMessages } }) => (
    <EventShow.Layout>
      <EventShow
        intlMessages={intlMessages}
        agenda={agendaFixtures as Agenda}
        fallback={{
          [`/api/agendas/slug/${agendaFixtures.slug}/events/slug/${eventFixtures.slug}?longDescriptionFormat=HTMLWithEmbeds`]:
            {
              success: true,
              event: eventFixtures,
            },
        }}
      />
    </EventShow.Layout>
  ),
  parameters: {
    nextjs: {
      router: {
        pathname: '/[agendaSlug]/events/[eventSlug]',
        asPath: `${agendaFixtures.slug}/events/${eventFixtures.slug}`,
        query: {
          agendaSlug: agendaFixtures.slug,
          eventSlug: eventFixtures.slug,
        },
      },
    },
  },
};

export const JEP2023 = {
  render: (_args, { loaded: { intlMessages } }) => (
    <EventShow.Layout>
      <EventShow
        intlMessages={intlMessages}
        agenda={agendaJEPFixtures as Agenda}
        fallback={{
          [`/api/agendas/slug/${agendaJEPFixtures.slug}/events/slug/${eventJEPFixtures.slug}?longDescriptionFormat=HTMLWithEmbeds`]:
            {
              success: true,
              event: eventJEPFixtures,
            },
        }}
      />
    </EventShow.Layout>
  ),
  parameters: {
    nextjs: {
      router: {
        pathname: '/[agendaSlug]/events/[eventSlug]',
        asPath: `${agendaJEPFixtures.slug}/events/${eventJEPFixtures.slug}`,
        query: {
          agendaSlug: agendaJEPFixtures.slug,
          eventSlug: eventJEPFixtures.slug,
        },
      },
    },
  },
};

export const WithNavigation = {
  render: (_args, { loaded: { intlMessages } }) => (
    <EventShow.Layout>
      <EventShow
        intlMessages={intlMessages}
        agenda={agendaNantesFixtures as Agenda}
        fallback={{
          [`/api/agendas/slug/${agendaNantesFixtures.slug}/events/slug/${eventNantesFixtures.slug}?longDescriptionFormat=HTMLWithEmbeds`]:
            {
              success: true,
              event: eventNantesFixtures,
            },
        }}
      />
    </EventShow.Layout>
  ),
  parameters: {
    nextjs: {
      router: {
        pathname: '/[agendaSlug]/events/[eventSlug]',
        asPath: `${agendaNantesFixtures.slug}/events/${eventNantesFixtures.slug}`,
        query: {
          agendaSlug: agendaNantesFixtures.slug,
          eventSlug: eventNantesFixtures.slug,
        },
      },
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
