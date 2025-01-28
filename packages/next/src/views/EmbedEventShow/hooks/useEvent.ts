import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';
import qs from 'qs';
import { useAgenda } from 'views/EventShow/contexts/agenda';
import type { Event } from 'views/EventShow/hooks/useEvent';

export default function useEvent({ referrer }) {
  const router = useRouter();
  const agenda = useAgenda();
  const { eventSlug } = router.query;

  const { data, ...rest } = useSWRImmutable<{ success: boolean; event: Event }>(
    // `/api/agendas/${agenda.uid}/events/slug/${eventSlug}`,
    `/api/agendas/${agenda.uid}/events/slug/${eventSlug}?${qs.stringify({
      longDescriptionFormat: 'HTMLWithEmbeds',
      cms: 'embed',
      host: referrer,
    })}`,
  );

  return { event: data.event, ...rest };
}
