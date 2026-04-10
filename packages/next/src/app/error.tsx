'use client';

import { ErrorDisplay } from 'components/ErrorDisplay';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay error={error} resetError={reset} />;
}
