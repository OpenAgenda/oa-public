'use client';

import { SWRConfig } from 'swr';
import DateFnsLocaleProvider from '@/src/components/DateFnsLocaleProvider';
import type { Agenda } from '@/src/types';
import EmbedAgendaShow from './EmbedAgendaShow';

type Props = {
  agenda: Agenda;
  fallback?: Record<string, any>;
  referrer?: string | null;
};

export default function EmbedAgendaShowClient({
  agenda,
  fallback,
  referrer,
}: Props) {
  return (
    <DateFnsLocaleProvider>
      <SWRConfig value={{ fallback: fallback ?? {} }}>
        <EmbedAgendaShow agenda={agenda} referrer={referrer ?? undefined} />
      </SWRConfig>
    </DateFnsLocaleProvider>
  );
}
