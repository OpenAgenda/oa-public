import React from 'react';
import ChildLayouts from '../components/ChildLayouts';
import ErrorBoundary from '../components/ErrorBoundary';
import AgendaHeader from '../components/AgendaHeader';

function AgendaLayout({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
}) {
  const { agenda } = extraProps;
  return (
    <ErrorBoundary onError={onError} FallbackComponent={FallbackComponent}>
      <AgendaHeader agenda={agenda} />
      <ChildLayouts
        layouts={childLayouts}
        extraProps={extraProps}
        onError={onError}
        FallbackComponent={FallbackComponent}
      >
        {children}
      </ChildLayouts>
    </ErrorBoundary>
  );
}

AgendaLayout.layoutName = 'AgendaLayout';

export default AgendaLayout;
