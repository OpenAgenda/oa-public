import { SWRConfig } from 'swr';
import EmbedEventShowView from '@/src/app/[locale]/embed/agendas/[agendaUid]/events/[eventSlug]/_components/EmbedEventShow';
import EmbedLayoutShell from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import { AgendaProvider } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import DateFnsLocaleProvider from '@/src/components/DateFnsLocaleProvider';
import { Agenda } from '@/src/types';
import intlMessagesLoader from '@/stories/loaders/intlMessagesLoader';
import ProvidersDecorator from '@/stories/decorators/ProvidersDecorator';
import agendaJEPFixtures from '@/stories/app/[agendaSlug]/events/[eventSlug]/fixtures/agenda.jep-2023-grand-est.json';
import eventJEPFixtures from '@/stories/app/[agendaSlug]/events/[eventSlug]/fixtures/event.jep-2023-grand-est.json';
import fetchLocale from '../../../../../utils/fetchLocale';

export default {
  title: 'app/embed/agendas/[agendaUid]/events/[eventSlug]',
  component: EmbedEventShowView,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
};

const fallbackKey = `/api/agendas/${agendaJEPFixtures.uid}/events/slug/${eventJEPFixtures.slug}?longDescriptionFormat=HTMLWithEmbeds&cms=embed`;

export const JEP2023 = {
  render: () => (
    <EmbedLayoutShell>
      <DateFnsLocaleProvider>
        <SWRConfig
          value={{
            fallback: {
              [fallbackKey]: { success: true, event: eventJEPFixtures },
            },
          }}
        >
          <AgendaProvider agenda={agendaJEPFixtures as Agenda}>
            <EmbedEventShowView />
          </AgendaProvider>
        </SWRConfig>
      </DateFnsLocaleProvider>
    </EmbedLayoutShell>
  ),
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: `/fr/embed/agendas/${agendaJEPFixtures.uid}/events/${eventJEPFixtures.slug}`,
        segments: [
          ['locale', 'fr'],
          ['agendaUid', String(agendaJEPFixtures.uid)],
          ['eventSlug', eventJEPFixtures.slug],
        ],
      },
    },
  },
};
