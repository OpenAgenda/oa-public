'use client';

import { SWRConfig } from 'swr';
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
    <SWRConfig value={{ fallback: fallback ?? {} }}>
      <EmbedAgendaShow agenda={agenda} referrer={referrer ?? undefined} />
    </SWRConfig>
  );
}
