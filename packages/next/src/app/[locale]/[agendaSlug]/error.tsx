'use client';

import { useParams } from 'next/navigation';
import AgendaError from './_components/AgendaError';

export default function AgendaErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { agendaSlug } = useParams<{ agendaSlug: string }>();
  return (
    <AgendaError
      statusCode={500}
      agendaSlug={agendaSlug}
      error={error}
      resetError={reset}
    />
  );
}
