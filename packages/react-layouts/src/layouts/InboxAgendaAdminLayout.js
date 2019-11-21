import React from 'react';
import useChildLayouts from '../hooks/useChildLayouts';

function InboxAgendaAdminLayout({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent
}) {
  const content = useChildLayouts(
    children,
    { extraProps, onError, FallbackComponent },
    childLayouts
  );

  return <div className="inbox inbox-agenda-admin">{content}</div>;
}

InboxAgendaAdminLayout.layoutName = 'InboxAgendaAdminLayout';

export default InboxAgendaAdminLayout;
