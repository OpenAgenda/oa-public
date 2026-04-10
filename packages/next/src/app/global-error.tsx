'use client';

import { ErrorDisplay } from 'components/ErrorDisplay';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorDisplay error={error} resetError={reset} />
      </body>
    </html>
  );
}
