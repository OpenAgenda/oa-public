import useSWRImmutable from 'swr/immutable';
import useLocationQuery from 'hooks/useLocationQuery';

const fetcher = url => fetch(url)
  .then(
    r => {
      if (r.ok) return r.json();
      // TODO should recreate an error with data in `await r.json()`
      // console.log('ERROR response', await r.json());
      throw new Error('Error');
    },
  );

export default function useLocationSet() {
  const query = useLocationQuery();

  const {
    data: locationSet,
    ...rest
  } = useSWRImmutable(
    query.locationSet ? `/api/locationSets/${query.locationSet}` : null,
    fetcher,
  );

  return { locationSet, ...rest };
}
