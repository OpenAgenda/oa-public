'use client';

import AgendaError from './_components/AgendaError';

export default function AgendaNotFound() {
  return <AgendaError statusCode={404} />;
}
