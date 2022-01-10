import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export default function useAgendaContext(agendaUid) {
  const res = useSelector(state => state.settings.apiRoot + state.res.agendaContext.replace(':agendaUid', agendaUid));
  const memberFreshness = useSelector(state => state.memberFreshness);

  const {
    isLoading: agendaContextIsLoading,
    data: agendaContext
  } = useQuery(`agendaContext.${agendaUid}`, () => axios.get(res).then(response => (response.data)), {
    staleTime: 1000,
  });

  const memberIsFresh = new Date(agendaContext?.me.member?.updatedAt) > new Date(memberFreshness);

  return useMemo(() => ({
    agendaContextIsLoading,
    agendaContext,
    memberIsFresh
  }), [agendaContextIsLoading, agendaContext, memberIsFresh]);
}
