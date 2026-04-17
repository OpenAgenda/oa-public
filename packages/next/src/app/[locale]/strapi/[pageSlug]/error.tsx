'use client';

import { ErrorDisplay } from '@/src/components/ErrorDisplay';

export default function StrapiErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay statusCode={500} error={error} resetError={reset} />;
}
