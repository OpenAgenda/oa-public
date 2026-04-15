'use client';

import { SWRConfig } from 'swr';
import type { Agenda } from '@/src/types';
import { AgendaProvider } from '../_context/agenda';
import EventShow from './EventShow';

type Props = {
  agenda: Agenda;
  eventFallbackKey: string;
  eventFallback: any;
};

export default function EventShowWrapper({
  agenda,
  eventFallbackKey,
  eventFallback,
}: Props) {
  return (
    <SWRConfig value={{ fallback: { [eventFallbackKey]: eventFallback } }}>
      <AgendaProvider agenda={agenda}>
        <EventShow />
      </AgendaProvider>
    </SWRConfig>
  );
}
