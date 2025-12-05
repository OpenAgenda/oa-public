import { useRouter } from 'next/router';
import { SWRConfig } from 'swr';
import { http, HttpResponse } from 'msw';
import EventShow from 'views/EventShow';
import ContextBar from 'views/EventShow/components/ContextBar';
import { AgendaProvider } from 'views/EventShow/contexts/agenda';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventFixtures from '../../fixtures/events/sample.json';

export default {
  title: 'views/EventShow/ContextBar',
  component: ContextBar,
  loaders: [intlMessagesLoader(EventShow.fetchLocale)],
  decorators: [ProvidersDecorator],
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

export const Contributor = {
  render: () => (
    <Fixtures event={eventFixtures}>
      <ContextBar />
    </Fixtures>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(
          `/api/me/agendas/${agendaFixtures.uid}/events/${eventFixtures.uid}`,
          () =>
            HttpResponse.json({
              member: {
                userUid: eventFixtures.ownerUid,
              },
              me: {
                member: {
                  userUid: eventFixtures.ownerUid,
                  role: 'contributor',
                },
                authorizations: {
                  canEditEvent: true,
                  canChangeState: false,
                  canPublishEvent: false,
                },
              },
            }),
        ),
      ],
    },
  },
};

export const ContributorRejectedEvent = {
  render: () => (
    <Fixtures
      event={{
        ...eventFixtures,
        state: -1,
        motive: 'TestMotive 😬\n new line \n other lineS',
      }}
    >
      <ContextBar />
    </Fixtures>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(
          `/api/me/agendas/${agendaFixtures.uid}/events/${eventFixtures.uid}`,
          () =>
            HttpResponse.json({
              member: {
                userUid: eventFixtures.ownerUid,
              },
              me: {
                member: {
                  userUid: eventFixtures.ownerUid,
                  role: 'contributor',
                },
                authorizations: {
                  canEditEvent: true,
                  canChangeState: false,
                  canPublishEvent: false,
                },
              },
            }),
        ),
      ],
    },
  },
};

export const Moderator = {
  render: () => (
    <Fixtures event={eventFixtures}>
      <ContextBar />
    </Fixtures>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(
          `/api/me/agendas/${agendaFixtures.uid}/events/${eventFixtures.uid}`,
          () =>
            HttpResponse.json({
              me: {
                member: {
                  role: 'moderator',
                },
                authorizations: {
                  canEditEvent: true,
                  canChangeState: true,
                  canPublishEvent: true,
                },
              },
            }),
        ),
      ],
    },
  },
};

export const ModeratorInvalid = {
  render: () => (
    <Fixtures event={{ ...eventFixtures, valid: false }}>
      <ContextBar />
    </Fixtures>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(
          `/api/me/agendas/${agendaFixtures.uid}/events/${eventFixtures.uid}`,
          () =>
            HttpResponse.json({
              member: {
                userUid: 31046551,
              },
              me: {
                member: {
                  role: 'moderator',
                },
                authorizations: {
                  canEditEvent: true,
                  canChangeState: true,
                  canPublishEvent: true,
                },
              },
            }),
        ),
      ],
    },
  },
};

export const Administrator = {
  render: () => (
    <Fixtures event={eventFixtures}>
      <ContextBar />
    </Fixtures>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(
          `/api/me/agendas/${agendaFixtures.uid}/events/${eventFixtures.uid}`,
          () =>
            HttpResponse.json({
              me: {
                member: {
                  role: 'administrator',
                },
                authorizations: {
                  canEditEvent: true,
                  canChangeState: true,
                  canPublishEvent: true,
                },
              },
            }),
        ),
      ],
    },
  },
};

export const InvalidEventOnStateOrFeaturedChange = {
  render: () => (
    <Fixtures event={{ ...eventFixtures, valid: false }}>
      <ContextBar />
    </Fixtures>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(
          `/api/me/agendas/${agendaFixtures.uid}/events/${eventFixtures.uid}`,
          () =>
            HttpResponse.json({
              me: {
                member: {
                  role: 'administrator',
                },
                authorizations: {
                  canEditEvent: true,
                  canChangeState: true,
                  canPublishEvent: true,
                },
              },
            }),
        ),
        http.patch(
          `/api/agendas/${agendaFixtures.uid}/events/${eventFixtures.uid}`,
          () => new HttpResponse(null, { status: 400 }),
        ),
      ],
    },
  },
};
