import { http, HttpResponse } from 'msw';
import EmbedAgendaShow from '@/src/app/[locale]/embed/agendas/[agendaUid]/_components/EmbedAgendaShow';
import EmbedLayoutShell from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import { Agenda } from '@/src/types';
import intlMessagesLoader from '@/stories/loaders/intlMessagesLoader';
import ProvidersDecorator from '@/stories/decorators/ProvidersDecorator';
import agendaFixtures from '@/stories/fixtures/mel.agenda.json';
import eventsFixtures from '@/stories/app/[agendaSlug]/fixtures/events.json';
import fetchLocale from '../../../../utils/fetchLocale';

export default {
  title: 'app/embed/agendas/[agendaUid]',
  component: EmbedAgendaShow,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: `/fr/embed/agendas/${agendaFixtures.uid}`,
      },
    },
  },
};

export const Sample = {
  render: () => (
    <EmbedLayoutShell>
      <EmbedAgendaShow agenda={agendaFixtures as Agenda} />
    </EmbedLayoutShell>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(`/api/agendas/slug/${agendaFixtures.slug}/events`, () =>
          HttpResponse.json(eventsFixtures),
        ),
      ],
    },
  },
};
