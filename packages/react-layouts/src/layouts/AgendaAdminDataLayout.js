import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';
import { useIntl } from 'react-intl';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import * as agendaAdminActions from '../reducers/agendaAdmin';
import ChildLayouts from '../components/ChildLayouts';

function AgendaAdminDataLayout({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
}) {
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();

  const { params } = useMemo(() => matchPath(location.pathname, '/:slug'), [
    location.pathname,
  ]);

  const dispatch = useDispatch();
  const loadLayoutData = useCallback(
    () => dispatch(agendaAdminActions.load(params.slug, intl.locale)),
    [dispatch, params.slug, intl.locale]
  );

  useEffect(() => {
    loadLayoutData();
  }, [loadLayoutData]);

  const user = useSelector(state => _.get(state, 'main.user', null));
  const loadError = useSelector(state => _.get(state, 'agendaAdmin.error', null));
  const agenda = useSelector(
    state => _.get(state, 'agendaAdmin.agenda', null),
    shallowEqual
  );
  const agendaSchema = useSelector(
    state => _.get(state, 'agendaAdmin.agendaSchema', null),
    shallowEqual
  );
  const member = useSelector(
    state => _.get(state, 'agendaAdmin.member', null),
    shallowEqual
  );
  const role = useSelector(
    state => _.get(state, 'agendaAdmin.role', null),
    shallowEqual
  );
  const sections = useSelector(
    state => _.get(state, 'agendaAdmin.sections', null),
    shallowEqual
  );

  const agendaUid = agenda?.uid;

  const verifyLocationCount = useCallback(() => {
    if (!agendaUid) return;
    dispatch(agendaAdminActions.verifyLocationCount(agendaUid));
  }, [dispatch, agendaUid]);

  useEffect(() => {
    verifyLocationCount();
  }, [verifyLocationCount]);

  useIsomorphicLayoutEffect(() => {
    if (loadError) {
      if (loadError?.response?.status === 403) {
        window.location.href = `/${params.slug}/unauthorized`;
      } else if (user) {
        history.replace('/home');
      } else {
        window.location.href = '/';
      }
    }
  }, [history, loadError, params.slug, user]);

  return (
    <ChildLayouts
      layouts={childLayouts}
      extraProps={extraProps}
      onError={onError}
      FallbackComponent={FallbackComponent}
      // additional extraProps
      agenda={agenda}
      agendaSchema={agendaSchema}
      role={role}
      sections={sections}
      member={member}
    >
      {children}
    </ChildLayouts>
  );
}

AgendaAdminDataLayout.layoutName = 'AgendaAdminDataLayout';

export default AgendaAdminDataLayout;
