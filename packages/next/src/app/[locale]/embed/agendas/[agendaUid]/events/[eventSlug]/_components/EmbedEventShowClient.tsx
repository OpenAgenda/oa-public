'use client';

import { SWRConfig } from 'swr';
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
    <SWRConfig value={{ fallback: { [fallbackKey]: fallbackEvent } }}>
      <AgendaProvider agenda={agenda}>
        <EmbedEventShow referrer={referrer ?? undefined} />
      </AgendaProvider>
    </SWRConfig>
  );
}
