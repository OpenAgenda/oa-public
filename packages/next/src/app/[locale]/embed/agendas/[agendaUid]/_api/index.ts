import { cache } from 'react';
import { headers } from 'next/headers';
import ky from 'ky';
import type { Agenda } from '@/src/types';
import { REQUEST_AGENDA_HEADER, peekAgenda } from '@/src/utils/requestAgenda';

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

export const fetchEmbedAgenda = cache(
  async (agendaUid: string): Promise<Agenda> => {
    // Read the pre-fetched agenda stashed by the proxy, if any. Matches by
    // uid since the embed URL carries an agenda uid (not a slug).
    const h = await headers();
    const reqId = h.get(REQUEST_AGENDA_HEADER);
    if (reqId) {
      const pre = peekAgenda(reqId);
      if (pre && String(pre.agenda.uid) === String(agendaUid)) {
        return pre.agenda;
      }
    }

    const api = await getApi();
    return api.get(`api/agendas/${agendaUid}?detailed=1`).json<Agenda>();
  },
);
