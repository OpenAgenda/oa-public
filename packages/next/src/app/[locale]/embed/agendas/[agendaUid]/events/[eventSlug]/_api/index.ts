import { cache } from 'react';
import { headers } from 'next/headers';
import ky from 'ky';
import type { Event } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_hooks/useEvent';
import { embedEventApiPath, buildEmbedEventSearch } from './eventApiPath';

export { buildEventFallbackKey } from './eventApiPath';

const getApi = cache(async () => {
  const headersList = await headers();

  return ky.create({
    prefixUrl: process.env.NEXT_API_INTERNAL_BASE_URL,
    headers: {
      Cookie: headersList.get('cookie') || '',
      Authorization: headersList.get('authorization') || '',
    },
  });
});

export type EventResponse = { success: boolean; event: Event };

// Upstream query string mirrors the Pages Router version: `cms=embed`,
// `host=<referrer>`, `longDescriptionFormat=HTMLWithEmbeds`. Referrer is part
// of the cache key because the upstream may render different content based on
// the caller domain (tracking, privacy).
export const fetchEmbedEvent = cache(
  async (
    agendaUid: string,
    eventSlug: string,
    { referrer }: { referrer?: string | null } = {},
  ): Promise<EventResponse> => {
    const api = await getApi();
    const search = buildEmbedEventSearch(referrer);
    return api
      .get(`${embedEventApiPath(agendaUid, eventSlug)}?${search}`)
      .json<EventResponse>();
  },
);
