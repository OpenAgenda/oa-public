import { useQuery } from 'react-query';
import ky from 'ky';

import useRes from './useRes.js';

export default (agenda, memberMode) => {
  if (!memberMode) return false;
  const res = useRes(agenda);
  const { isLoading, error, refetch, data } = useQuery(
    ['agenda-memberSchema', agenda.uid],
    () => ky(res.memberSchema).json(),
  );
  return {
    isLoadingMember: isLoading,
    error,
    refetch,
    memberSchema: data?.schema || null,
    memberParents: data?.parents,
    memberReservedFields: data?.reservedFields,
  };
};
