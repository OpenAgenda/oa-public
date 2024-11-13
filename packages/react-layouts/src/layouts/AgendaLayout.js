import { ErrorBoundary } from '@sentry/react';
import ChildLayouts from '../components/ChildLayouts.js';
import AgendaHeader from '../components/AgendaHeader.js';

function AgendaLayout({ childLayouts, children, extraProps, fallback }) {
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
