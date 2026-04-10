'use client';

import { ErrorDisplay } from 'components/ErrorDisplay';

export default function NotFound() {
  return <ErrorDisplay statusCode={404} />;
}
