import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import useIsomorphicLayoutEffectModule from 'react-use/lib/useIsomorphicLayoutEffect.js';
import ky from 'ky';
import qs from 'qs';
import * as agendaAdminActions from '../reducers/agendaAdmin.js';
import ChildLayouts from '../components/ChildLayouts.js';
import Loading from '../components/Loading.js';

const useIsomorphicLayoutEffect = useIsomorphicLayoutEffectModule.default || useIsomorphicLayoutEffectModule;

function AgendaAdminDataLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
}) {
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const { params } = useMemo(
    () => matchPath(location.pathname, '/:slug'),
    [location.pathname],
  );

  const { data, isLoading, error } = useQuery(
    ['react-layouts', 'agendaAdminData', { slug: params.slug }],
    () =>
      ky(`/${params.slug}/admin/layout`, {
        searchParams: qs.stringify({
          lang: intl.locale,
        }),
      }).json(),
    {
      notifyOnChangeProps: ['data', 'isLoading', 'error'],
    },
  );

  const { user } = extraProps;

  const agendaSlug = data?.agenda?.slug;

  const verifyLocationCount = useCallback(() => {
    if (!agendaSlug) return;
    dispatch(agendaAdminActions.verifyLocationCount(agendaSlug));
  }, [dispatch, agendaSlug]);

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
