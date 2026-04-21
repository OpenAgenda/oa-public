'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import qs from 'qs';
import useAppLocationQuery from '@/src/utils/useAppLocationQuery';

export default function useNcEffect({ agendaUid, eventUid }) {
  const pathname = usePathname();
  const query = useAppLocationQuery() as any;
  // Guard against React StrictMode's double-invoke of effects in dev: without
  // it, the NC stored in sessionStorage would be re-written and `from` could
  // drift. Only the first mount should consume the `?nc=...` URL param.
  const consumed = useRef(false);

  useEffect(() => {
    // Wait for both UIDs before consuming `?nc=...`. Without this guard, an
    // early render with `eventUid` undefined would write the NC under the key
    // `agendaUid.undefined`, leaving it unreachable when EventShow later asks
    // for the real key.
    if (consumed.current || !query.nc || !agendaUid || !eventUid) {
      return;
    }
    consumed.current = true;

    window.sessionStorage.setItem(
      'EventShow:nc',
      JSON.stringify({
        [`${agendaUid}.${eventUid}`]: {
          ...query.nc,
          state: query.nc.state ? query.nc.state.map(Number) : query.nc.state,
          from: query.nc.from ? parseInt(query.nc.from, 10) : query.nc.from,
        },
      }),
    );
    const search = qs.stringify(
      { ...query, nc: undefined },
      { addQueryPrefix: true },
    );
    // history.replaceState vs router.replace: avoids an RSC refetch just
    // after sibling navigation. useSearchParams observes history changes
    // since Next 14.1.
    window.history.replaceState(null, '', pathname + search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
