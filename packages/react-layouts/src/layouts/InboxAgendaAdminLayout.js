import React from 'react';
import ChildLayouts from '../components/ChildLayouts';

function InboxAgendaAdminLayout({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
}) {
  return (
    <div className="inbox inbox-agenda-admin">
      <ChildLayouts
        layouts={childLayouts}
        extraProps={extraProps}
        onError={onError}
        FallbackComponent={FallbackComponent}
      >
        {children}
      </ChildLayouts>
    </div>
  );
}

InboxAgendaAdminLayout.layoutName = 'InboxAgendaAdminLayout';

export default InboxAgendaAdminLayout;
