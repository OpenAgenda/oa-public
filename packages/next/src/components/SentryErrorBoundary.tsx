import { ErrorBoundary as SErrorBoundary } from '@sentry/nextjs';
import { ErrorDisplay } from './ErrorDisplay';

export default function SentryErrorBoundary({ children }) {
  return (
    <SErrorBoundary
      beforeCapture={scope => {
        scope.setLevel('fatal');
      }}
      fallback={({ error, eventId, resetError }) => (
        <ErrorDisplay error={error} eventId={eventId} resetError={resetError} />
      )}
    >
      {children}
    </SErrorBoundary>
  );
}
