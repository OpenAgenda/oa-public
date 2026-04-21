'use client';

import { useEffect } from 'react';
import { logError } from '@/src/utils/sentry';
import { errorToJSON } from '@/src/utils/errorToJSON';
import EmbedEventError from './_components/EmbedEventError';

export default function EmbedEventRouteError({
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
    <EmbedEventError
      statusCode={500}
      error={errorToJSON(error)}
      resetError={reset}
    />
  );
}
