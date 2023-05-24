import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { matchPath, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useApiClient } from '@openagenda/react-shared';
import ChildLayouts from '../components/ChildLayouts';
import Loading from '../components/Loading';

function AgendaDataLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
}) {
  const intl = useIntl();
  const apiClient = useApiClient();
  const location = useLocation();

  const { params } = useMemo(
    () => matchPath(location.pathname, '/:slug'),
    [location.pathname]
  );

  const { data, isLoading, error } = useQuery(
    ['react-layouts', 'AgendaData', { slug: params.slug }],
    async () => (
      await apiClient.get(`/api/agendas/slug/${params.slug}`, {
        params: {
          lang: intl.locale,
        },
      })
    ).data,
    {
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    }
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
