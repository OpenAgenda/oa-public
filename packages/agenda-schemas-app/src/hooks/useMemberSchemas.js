import { useQuery } from 'react-query';
import axios from 'axios';

import useRes from './useRes';

export default agenda => {
  const res = useRes(agenda);
  const { isLoading, error, data } = useQuery('agenda-memberSchema', () =>
    axios.get(res.memberSchema, { params: {} }).then(response => response.data));
  console.log('useMemberSchema', data);
  return {
    isLoadingMember: isLoading,
    error,
    memberSchema: data?.schema || null,
    memberParents: data?.parents,
  };
};
