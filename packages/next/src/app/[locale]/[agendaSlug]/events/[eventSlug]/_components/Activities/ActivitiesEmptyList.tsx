import { useActivitiesContext } from '@/src/views/EventShow/components/Activities/context';

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
