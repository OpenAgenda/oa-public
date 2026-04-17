'use client';

import { ErrorDisplay } from '@/src/components/ErrorDisplay';

export default function StrapiNotFound() {
  return <ErrorDisplay statusCode={404} />;
}
