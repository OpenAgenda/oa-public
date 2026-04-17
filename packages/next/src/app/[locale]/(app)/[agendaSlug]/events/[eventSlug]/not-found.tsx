'use client';

import { useParams } from 'next/navigation';
import EventError from './_components/EventError';

export default function EventNotFound() {
  const { agendaSlug, eventSlug } = useParams<{
    agendaSlug: string;
    eventSlug: string;
  }>();
  return (
    <EventError
      statusCode={404}
      agendaSlug={agendaSlug}
      eventSlug={eventSlug}
    />
  );
}
