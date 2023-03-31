import React from 'react';
import { ErrorBoundary } from '@sentry/react';
import ChildLayouts from '../components/ChildLayouts';
import AgendaHeader from '../components/AgendaHeader';

function AgendaLayout({
  childLayouts,
  children,
  extraProps,
  fallback,
}) {
  const { agenda } = extraProps;
  return (
    <ErrorBoundary fallback={fallback}>
      <AgendaHeader agenda={agenda} />
      <ChildLayouts
        layouts={childLayouts}
        extraProps={extraProps}
        fallback={fallback}
      >
        {children}
      </ChildLayouts>
    </ErrorBoundary>
  );
}

AgendaLayout.layoutName = 'AgendaLayout';

export default AgendaLayout;
