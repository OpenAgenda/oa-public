import { useState, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import NotificationModal from 'components/NotificationModal';
import messages from 'components/ErrorDisplay/messages';

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    typeof error.message === 'string' &&
    error.message.toLowerCase().startsWith('failed to load chunk')
  );
}

export default function ChunkErrorListener({
  children,
}: {
  children: React.ReactNode;
}) {
  const intl = useIntl();
  const [hasError, setHasError] = useState(false);

  const handleRejection = useCallback((event: PromiseRejectionEvent) => {
    if (!isChunkLoadError(event.reason)) return;

    event.preventDefault();
    setHasError(true);
  }, []);

  useEffect(() => {
    window.addEventListener('unhandledrejection', handleRejection);
    return () =>
      window.removeEventListener('unhandledrejection', handleRejection);
  }, [handleRejection]);

  return (
    <>
      {children}
      {hasError ? (
        <NotificationModal
          onClose={() => {}}
          title={intl.formatMessage(messages.networkError)}
          message={intl.formatMessage(messages.networkErrorMsg)}
          action={intl.formatMessage(messages.retry)}
          onAction={() => window.location.reload()}
          showCloseButton={false}
        />
      ) : null}
    </>
  );
}
