'use client';

import { useEffect } from 'react';
import { logError } from '@/src/utils/sentry';
import { errorToJSON } from '@/src/utils/errorToJSON';
import EmbedAgendaError from './_components/EmbedAgendaError';

export default function EmbedAgendaRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error);
  }, [error]);

  return (
    <EmbedAgendaError
      statusCode={500}
      error={errorToJSON(error)}
      resetError={reset}
    />
  );
}
