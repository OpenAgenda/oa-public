'use client';

import { useParams } from 'next/navigation';
import useSWRImmutable from 'swr/immutable';
import qs from 'qs';
import { useAgenda } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import type { Event } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_hooks/useEvent';

export default function useEvent({ referrer }: { referrer?: string }) {
  const params = useParams<{ eventSlug: string }>();
  const agenda = useAgenda();
  const eventSlug = params?.eventSlug;

  const { data, ...rest } = useSWRImmutable<{ success: boolean; event: Event }>(
    `/api/agendas/${agenda.uid}/events/slug/${eventSlug}?${qs.stringify({
      longDescriptionFormat: 'HTMLWithEmbeds',
      cms: 'embed',
      host: referrer,
    })}`,
  );

  return { event: data.event, ...rest };
}
