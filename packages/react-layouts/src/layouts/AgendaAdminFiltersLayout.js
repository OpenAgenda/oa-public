import { useRef } from 'react';
import { ErrorBoundary } from '@sentry/react';
import ChildLayouts from '../components/ChildLayouts.js';
import AdminHeader from '../components/AdminHeader.js';
import AdminSections from '../components/AdminSections.js';

function AgendaAdminFiltersLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
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
        <div className="col-md-offset-2 col-md-2 col-sm-12 nav wsq hidden-print">
          <AdminSections sections={sections} agenda={agenda} role={role} />
        </div>
        <div
          className="col-md-3 col-md-push-5 col-sm-12 wsq filters hidden-print"
          ref={filtersContainerRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          <ErrorBoundary fallback={fallback}>
            <ChildLayouts
              layouts={childLayouts}
              extraProps={extraProps}
              fallback={fallback}
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
