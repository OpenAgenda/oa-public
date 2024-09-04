import { useRouter } from 'next/router';
import { useEffect } from 'react';
import qs from 'qs';
import useLocationQuery from 'hooks/useLocationQuery';

export default function useNcEffect({ agendaUid, eventUid }) {
  const router = useRouter();
  const query = useLocationQuery() as any;

  useEffect(() => {
    if (!query.nc) {
      return;
    }

    // if (!query.nc) {
    //   window.sessionStorage.removeItem('EventShow:nc');
    //   return;
    // }

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
    const url = new URL(router.asPath, 'https://n');
    url.search = qs.stringify(
      { ...query, nc: undefined },
      { addQueryPrefix: true },
    );
    router.replace(url.pathname + url.search, null, {
      shallow: true,
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
