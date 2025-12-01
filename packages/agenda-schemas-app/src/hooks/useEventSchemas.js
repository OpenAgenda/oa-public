import { useQuery } from 'react-query';
import ky from 'ky';

import useRes from './useRes.js';

export default (agenda, memberMode) => {
  if (memberMode) return false;
  const res = useRes(agenda);
  const { isLoading, error, refetch, data } = useQuery(
    ['agenda-eventSchema', agenda.uid],
    () => ky(res.eventSchema).json(),
    { staleTime: Infinity },
  );
  return {
    isLoading,
    error,
    refetch,
    schema: data?.schema
      ? {
        ...data.schema,
        fields: data.schema.fields?.filter((f) => f.field !== 'extIds'),
      }
      : null,
    parents:
      data?.parents?.map((parent) => ({
        ...parent,
        schema: parent.schema
          ? {
            ...parent.schema,
            fields: parent.schema.fields?.filter((f) => f.field !== 'extIds'),
          }
          : parent.schema,
      })) || [],
  };
};
