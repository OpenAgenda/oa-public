import { useQuery } from 'react-query';
import axios from 'axios';

import useRes from './useRes';

export default (agenda, memberMode) => {
  if (!memberMode) return false;
  const res = useRes(agenda);
  const { isLoading, error, data } = useQuery(['agenda-memberSchema', agenda.uid], () =>
    axios.get(res.memberSchema, { params: { split: 1 } }).then(response => response.data));
  return {
    isLoadingMember: isLoading,
    error,
    memberSchema: data?.schema || null,
    memberParents: data?.parents,
  };
};
