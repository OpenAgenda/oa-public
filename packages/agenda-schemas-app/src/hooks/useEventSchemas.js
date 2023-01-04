import { useQuery } from 'react-query';
import axios from 'axios';

import useRes from './useRes';

export default (agenda, memberMode) => {
  if (memberMode) return false;
  const res = useRes(agenda);
  const { isLoading, error, data } = useQuery(['agenda-eventSchema', agenda.uid], () =>
    axios.get(res.eventSchema, { params: {} }).then(response => response.data), { staleTime: Infinity });
  return {
    isLoading,
    error,
    schema: data?.schema || null,
    parents: data?.parents,
  };
};
