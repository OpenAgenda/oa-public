import EmbedEventShow from 'pages/embed/agendas/[agendaUid]/events/[eventSlug]';
import EmbedEventShowView from 'views/EmbedEventShow';
import EmbedLayout from 'components/EmbedLayout';
import { Agenda } from 'types';
import intlMessagesLoader from '@/stories/loaders/intlMessagesLoader';
import ProvidersDecorator from '@/stories/decorators/ProvidersDecorator';
import agendaJEPFixtures from '@/stories/pages/[agendaSlug]/[eventSlug]/fixtures/agenda.jep-2023-grand-est.json';
import eventJEPFixtures from '@/stories/pages/[agendaSlug]/[eventSlug]/fixtures/event.jep-2023-grand-est.json';

export default {
  title: 'pages/embed/agendas/[agendaUid]/events/[eventSlug]',
  component: EmbedEventShow,
  loaders: [intlMessagesLoader(EmbedEventShowView.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const JEP2023 = {
  render: (_args, { loaded: { intlMessages } }) => (
    <EmbedLayout>
      <EmbedEventShow
        intlMessages={intlMessages}
        agenda={agendaJEPFixtures as Agenda}
        fallback={{
          [`/api/agendas/${agendaJEPFixtures.uid}/events/slug/${eventJEPFixtures.slug}?longDescriptionFormat=HTMLWithEmbeds&cms=embed`]:
            {
              success: true,
              event: eventJEPFixtures,
            },
        }}
      />
    </EmbedLayout>
  ),
  parameters: {
    nextjs: {
      router: {
        pathname: '/embed/agendas/[agendaUid]/events/[eventSlug]',
        asPath: `/embed/agendas/${agendaJEPFixtures.uid}/events/${eventJEPFixtures.slug}`,
        query: {
          agendaUid: agendaJEPFixtures.uid,
          eventSlug: eventJEPFixtures.slug,
        },
      },
    },
  },
};
