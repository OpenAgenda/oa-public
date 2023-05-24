import React from 'react';
import { ErrorBoundary } from '@sentry/react';
import ChildLayouts from '../components/ChildLayouts';
import AdminHeader from '../components/AdminHeader';
import AdminSections from '../components/AdminSections';

function AgendaAdminLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
}) {
  const { agenda, role, sections } = extraProps;

  return (
    <div className="container agenda-admin">
      <AdminHeader agenda={agenda} />

      <div className="row wsq">
        <div className="col col-sm-3 nav">
          <AdminSections sections={sections} agenda={agenda} role={role} />
        </div>

        <div className="col col-sm-9 body" style={{ paddingTop: 0 }}>
          <ErrorBoundary fallback={fallback}>
            <ChildLayouts
              layouts={childLayouts}
              extraProps={extraProps}
              fallback={fallback}
            >
              {children}
            </ChildLayouts>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

AgendaAdminLayout.layoutName = 'AgendaAdminLayout';

export default AgendaAdminLayout;
