'use client';

import { useParams } from 'next/navigation';
import useSWRImmutable from 'swr/immutable';
import { useAgenda } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import type { Event } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_hooks/useEvent';
import { buildEventFallbackKey } from '../_api/eventApiPath';

export default function useEvent({ referrer }: { referrer?: string }) {
  const params = useParams<{ eventSlug: string }>();
  const agenda = useAgenda();
  const eventSlug = params?.eventSlug;

  const { data, ...rest } = useSWRImmutable<{ success: boolean; event: Event }>(
    // Same key builder as the server fallback so SWR hydrates instead of
    // re-fetching, and so a `<uid>_<slug>` segment resolves by uid.
    buildEventFallbackKey(String(agenda.uid), eventSlug, referrer),
  );

  return { event: data.event, ...rest };
}
