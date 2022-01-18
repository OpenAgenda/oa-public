import { useQuery } from 'react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import useRes from './useRes';

export default (agenda, page, search) => {
  const res = useRes(agenda);
  const size = useSelector(state => state.settings.pageSize);
  const from = size * (page - 1);

  const { isLoading, error, data } = useQuery(['locations', page, search],
    () => (
      axios.get(res.index, {
        params: {
          page, from, size, search: search.search, uids: search.uids, eventCount: true, hasNull: search.hasNull
        }
      }).then(response => response.data)
    ));
  return {
    isLoading,
    error,
    locations: data?.locations,
    total: data?.total,
    size,
  };
};
