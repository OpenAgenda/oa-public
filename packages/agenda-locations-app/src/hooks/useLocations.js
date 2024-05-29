import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import useRes from './useRes';

export default (agenda, page, search) => {
  const res = useRes(agenda);
  const size = useSelector(state => state.settings.pageSize);
  const from = size * (page - 1);

  const { isLoading, error, data } = useQuery(
    ['locations', page, search],
    async () => {
      const params = new URLSearchParams();

      if (page !== undefined) params.append('page', page);
      if (from !== undefined) params.append('from', from);
      if (size !== undefined) params.append('size', size);
      if (search.search !== undefined) params.append('search', search.search);
      if (search.uids !== undefined) params.append('uids', search.uids);
      if (search.hasNull !== undefined) params.append('hasNull', search.hasNull);
      if (search.state !== undefined) params.append('state', search.state);
      if (search.hasDuplicateCandidates !== undefined) params.append('hasDuplicateCandidates', search.hasDuplicateCandidates);

      const url = `${res.index}${res.index.includes('?') ? '&' : '?'}${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Invalid status (${response.status})`);
      }
      return response.json();
    },
  );
  return {
    isLoading,
    error,
    locations: data?.locations,
    total: data?.total,
    size,
  };
};
