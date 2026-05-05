'use client';

import { useActivitiesContext } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/Activities/context';

export function ActivitiesEmptyList({ children }) {
  const { error, isLoadingInitialData, isEmpty } = useActivitiesContext();

  if (isLoadingInitialData || error) {
    return null;
  }

  if (isEmpty) {
    return children;
  }

  return null;
}
