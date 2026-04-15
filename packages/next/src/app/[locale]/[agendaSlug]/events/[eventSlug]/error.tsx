'use client';

import { useParams } from 'next/navigation';
import EventError from './_components/EventError';

export default function EventErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { agendaSlug, eventSlug } = useParams<{
    agendaSlug: string;
    eventSlug: string;
  }>();
  return (
    <EventError
      statusCode={500}
      agendaSlug={agendaSlug}
      eventSlug={eventSlug}
      error={error}
      resetError={reset}
    />
  );
}
