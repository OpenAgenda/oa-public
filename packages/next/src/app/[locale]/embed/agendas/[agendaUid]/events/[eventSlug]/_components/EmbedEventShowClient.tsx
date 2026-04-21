'use client';

import { SWRConfig } from 'swr';
import DateFnsLocaleProvider from '@/src/components/DateFnsLocaleProvider';
import { AgendaProvider } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import type { Agenda } from '@/src/types';
import type { EventResponse } from '../_api';
import EmbedEventShow from './EmbedEventShow';

type Props = {
  agenda: Agenda;
  fallbackKey: string;
  fallbackEvent: EventResponse;
  referrer?: string | null;
};

export default function EmbedEventShowClient({
  agenda,
  fallbackKey,
  fallbackEvent,
  referrer,
}: Props) {
  return (
    <DateFnsLocaleProvider>
      <SWRConfig value={{ fallback: { [fallbackKey]: fallbackEvent } }}>
        <AgendaProvider agenda={agenda}>
          <EmbedEventShow referrer={referrer ?? undefined} />
        </AgendaProvider>
      </SWRConfig>
    </DateFnsLocaleProvider>
  );
}
