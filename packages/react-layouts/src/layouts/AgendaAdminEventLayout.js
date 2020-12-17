import _ from 'lodash';
import React, { useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import ChildLayouts from '../components/ChildLayouts';
import ErrorBoundary from '../components/ErrorBoundary';
import Loading from '../components/Loading';
import AdminHeader from '../components/AdminHeader';
import AdminSections from '../components/AdminSections';

function AgendaAdminEventLayout({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
}) {
  const filtersContainerRef = useRef();
  const isLoading = useSelector(state => _.get(state, 'agendaAdmin.loading', true));
  const loadError = useSelector(state => _.get(state, 'agendaAdmin.error', null));
  const agenda = useSelector(
    state => _.get(state, 'agendaAdmin.agenda', null),
    shallowEqual
  );
  const role = useSelector(
    state => _.get(state, 'agendaAdmin.role', null),
    shallowEqual
  );

  if (loadError) {
    // Display Loading waiting redirection
    return <Loading />;
  }

  return isLoading ? (
    <Loading />
  ) : (
    <div className="container-fluid agenda-admin agenda-admin-event-layout">
      <div className="row">
        <div className="col-md-offset-2 col-md-7 wsq">
          <AdminHeader agenda={agenda} />
        </div>
      </div>
      <div className="row">
        <div className="col-md-offset-2 col-md-2 col-sm-12 nav wsq">
          <AdminSections agenda={agenda} role={role} />
        </div>
        <div
          className="col-md-3 col-md-push-5 col-sm-12 wsq filters"
          ref={filtersContainerRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq">
          <ErrorBoundary
            onError={onError}
            FallbackComponent={FallbackComponent}
          >
            <ChildLayouts
              layouts={childLayouts}
              extraProps={extraProps}
              onError={onError}
              FallbackComponent={FallbackComponent}
              // additional extraProps
              filtersContainerRef={filtersContainerRef}
            >
              {children}
            </ChildLayouts>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

AgendaAdminEventLayout.layoutName = 'AgendaAdminEventLayout';

export default AgendaAdminEventLayout;
