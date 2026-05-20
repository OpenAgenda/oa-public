import { cache } from 'react';
import { headers } from 'next/headers';
import ky from 'ky';
import qs from 'qs';
import type { Agenda } from '@/src/types';
import parseEventUid from '@/src/utils/parseEventUid';
import { REQUEST_AGENDA_HEADER, peekAgenda } from '@/src/utils/requestAgenda';
import type { Event } from '../events/[eventSlug]/_hooks/useEvent';

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

export const fetchAgenda = cache(
  async (
    agendaSlug: string,
    { includeMemberSchema = false }: { includeMemberSchema?: boolean } = {},
  ): Promise<Agenda> => {
    // Read the pre-fetched agenda stashed by the proxy, if any. Avoids a
    // duplicate HTTP round-trip when the proxy already fetched it to build
    // the per-agenda CSP. The proxy always fetches the superset, so any
    // requested shape is satisfied.
    const h = await headers();
    const reqId = h.get(REQUEST_AGENDA_HEADER);
    if (reqId) {
      const pre = peekAgenda(reqId);
      if (pre && pre.agenda.slug === agendaSlug) return pre.agenda;
    }

    const api = await getApi();
    const search = qs.stringify({
      detailed: 1,
      ...includeMemberSchema ? { includeMemberSchema: 1 } : {},
    });
    return api.get(`api/agendas/slug/${agendaSlug}?${search}`).json<Agenda>();
  },
);

export type EventResponse = { success: boolean; event: Event };

export const fetchEvent = cache(
  async (
    agendaSlug: string,
    eventSlugOrUidSlug: string,
  ): Promise<EventResponse> => {
    const api = await getApi();
    const uid = parseEventUid(eventSlugOrUidSlug);
    const path = uid
      ? `api/agendas/slug/${agendaSlug}/events/${uid}`
      : `api/agendas/slug/${agendaSlug}/events/slug/${eventSlugOrUidSlug}`;
    return api
      .get(`${path}?longDescriptionFormat=HTMLWithEmbeds`)
      .json<EventResponse>();
  },
);
