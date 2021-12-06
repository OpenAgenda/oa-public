import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useDetailedAgenda(agendaUID) {
  const res = useSelector(state => state.settings.apiRoot + state.res.detailedAgenda.replace(':agendaUid', agendaUID));

  const {
    isLoading: detailedAgendaIsLoading,
    data: detailedAgenda
  } = useQuery(
    `detailedAgenda${agendaUID}`,
    () => axios.get(res).then(response => response.data)
  );

  return {
    detailedAgendaIsLoading,
    detailedAgenda
  };
}
