import React from 'react';
import ChildLayouts from '../components/ChildLayouts';

function InboxAgendaAdminLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
}) {
  return (
    <div className="inbox inbox-agenda-admin">
      <ChildLayouts
        layouts={childLayouts}
        extraProps={extraProps}
        fallback={fallback}
      >
        {children}
      </ChildLayouts>
    </div>
  );
}

InboxAgendaAdminLayout.layoutName = 'InboxAgendaAdminLayout';

export default InboxAgendaAdminLayout;
