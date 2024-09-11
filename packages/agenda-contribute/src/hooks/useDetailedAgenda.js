import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useDetailedAgenda(agendaUID) {
  const res = useSelector(
    (state) =>
      state.settings.apiRoot
      + state.res.detailedAgenda.replace(':agendaUid', agendaUID),
  );

  const { isLoading: detailedAgendaIsLoading, data: detailedAgenda } = useQuery(
    `detailedAgenda${agendaUID}`,
    () =>
      fetch(res).then((response) => {
        if (!response.ok) {
          throw new Error(`Invalid status (${response.status})`);
        }
        return response.json();
      }),
  );

  return {
    detailedAgendaIsLoading,
    detailedAgenda,
  };
}
