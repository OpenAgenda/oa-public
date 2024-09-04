import useSWRImmutable from 'swr/immutable';
import useLocationQuery from 'hooks/useLocationQuery';

export default function useLocationSet() {
  const query = useLocationQuery();

  const { data: locationSet, ...rest } = useSWRImmutable(
    query.locationSet ? `/api/locationSets/${query.locationSet}` : null,
  );

  return { locationSet, ...rest };
}
