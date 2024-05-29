import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

const validateStatus = status => (status >= 200 && status < 300) || 404;

export default function useAgendaContext(agendaUid) {
  const res = useSelector(state => state.settings.apiRoot + state.res.agendaContext.replace(':agendaUid', agendaUid));
  const memberFreshness = useSelector(state => state.memberFreshness);

  const {
    isLoading: agendaContextIsLoading,
    data: agendaContext,
  } = useQuery(
    `agendaContext.${agendaUid}`,
    () => fetch(res)
      .then(response => {
        if (!validateStatus(response.status)) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.json();
      })
      .then(data => (data instanceof Object ? data : null)),
    {
      staleTime: 1000,
    },
  );

  const memberIsFresh = new Date(agendaContext?.me?.member?.updatedAt) > new Date(memberFreshness);

  return useMemo(() => ({
    agendaContextIsLoading,
    agendaContext,
    memberIsFresh,
  }), [agendaContextIsLoading, agendaContext, memberIsFresh]);
}
