import React, { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useIsomorphicLayoutEffect } from 'react-use';
import { useApiClient } from '@openagenda/react-shared';
import * as agendaAdminActions from '../reducers/agendaAdmin';
import ChildLayouts from '../components/ChildLayouts';
import Loading from '../components/Loading';

function AgendaAdminDataLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
}) {
  const intl = useIntl();
  const history = useHistory();
  const apiClient = useApiClient();
  const location = useLocation();
  const dispatch = useDispatch();

  const { params } = useMemo(
    () => matchPath(location.pathname, '/:slug'),
    [location.pathname]
  );

  const { data, isLoading, error } = useQuery(
    ['react-layouts', 'agendaAdminData', { slug: params.slug }],
    async () => (
      await apiClient.get(`/${params.slug}/admin/layout`, {
        params: {
          lang: intl.locale,
        },
      })
    ).data,
    {
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    }
  );

  const { user } = extraProps;

  const agendaUid = data?.agenda?.uid;

  const verifyLocationCount = useCallback(() => {
    if (!agendaUid) return;
    dispatch(agendaAdminActions.verifyLocationCount(agendaUid));
  }, [dispatch, agendaUid]);

  useEffect(() => {
    verifyLocationCount();
  }, [verifyLocationCount]);

  useIsomorphicLayoutEffect(() => {
    if (error) {
      if (error?.response?.status === 403) {
        window.location.href = `/${params.slug}/unauthorized`;
      } else if (user) {
        history.replace('/home');
      } else {
        window.location.href = '/';
      }
    }
  }, [history, error, params.slug, user]);

  if (isLoading || error) {
    return <Loading />;
  }

  return (
    <ChildLayouts
      layouts={childLayouts}
      extraProps={extraProps}
      fallback={fallback}
      // additional extraProps
      agenda={data.agenda}
      agendaSchema={data.schema}
      role={data.role}
      sections={data.sections}
      member={data.member}
    >
      {children}
    </ChildLayouts>
  );
}

AgendaAdminDataLayout.layoutName = 'AgendaAdminDataLayout';

export default AgendaAdminDataLayout;
