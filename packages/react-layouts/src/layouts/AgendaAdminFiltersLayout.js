import React, { useRef } from 'react';
import ChildLayouts from '../components/ChildLayouts';
import ErrorBoundary from '../components/ErrorBoundary';
import AdminHeader from '../components/AdminHeader';
import AdminSections from '../components/AdminSections';

function AgendaAdminFiltersLayout({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
}) {
  const filtersContainerRef = useRef();

  const { agenda, role, sections } = extraProps;

  return (
    <div className="container-fluid agenda-admin agenda-admin-filters-layout">
      <div className="row">
        <div className="col-md-offset-2 col-md-7 wsq">
          <AdminHeader agenda={agenda} />
        </div>
      </div>
      <div className="row body">
        <div className="col-md-offset-2 col-md-2 col-sm-12 nav wsq">
          <AdminSections sections={sections} agenda={agenda} role={role} />
        </div>
        <div
          className="col-md-3 col-md-push-5 col-sm-12 wsq filters"
          ref={filtersContainerRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
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

AgendaAdminFiltersLayout.layoutName = 'AgendaAdminFiltersLayout';

export default AgendaAdminFiltersLayout;
