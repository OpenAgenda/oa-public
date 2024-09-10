import useSWRImmutable from 'swr/immutable';
import useLocationQuery from 'hooks/useLocationQuery';

export default function useNetwork() {
  const query = useLocationQuery();

  const { data: network, ...rest } = useSWRImmutable(
    query.network ? `/api/networks/${query.network}` : null,
  );

  return { network, ...rest };
}
