import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useEvent(agendaUid, eventUid) {
  const res = useSelector(state => state.APIRoot + state.res.event.replace(':agendaUid', agendaUid).replace(':eventUid', eventUid));

  const {
    isLoading: eventIsLoading,
    data: event
  } = useQuery('event', () => axios.get(res).then(response => (response.data)));

  return {
    eventIsLoading,
    event
  };
}
