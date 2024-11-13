import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { matchPath, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import ky from 'ky';
import qs from 'qs';
import ChildLayouts from '../components/ChildLayouts.js';
import Loading from '../components/Loading.js';

function AgendaDataLayout({ childLayouts, children, extraProps, fallback }) {
  const intl = useIntl();
  const location = useLocation();

  const { params } = useMemo(
    () => matchPath(location.pathname, '/:slug'),
    [location.pathname],
  );

  const { data, isLoading, error } = useQuery(
    ['react-layouts', 'AgendaData', { slug: params.slug }],
    () =>
      ky(`/api/agendas/slug/${params.slug}`, {
        searchParams: qs.stringify({
          lang: intl.locale,
        }),
      }).json(),
    {
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    },
  );

  if (isLoading || error) {
    return <Loading />;
  }

  return (
    <ChildLayouts
      layouts={childLayouts}
      extraProps={extraProps}
      fallback={fallback}
      // additional extraProps
      agenda={data}
      role={data.role}
    >
      {children}
    </ChildLayouts>
  );
}

AgendaDataLayout.layoutName = 'AgendaDataLayout';

export default AgendaDataLayout;
