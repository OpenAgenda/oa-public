import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useEventContext(agendaUid, eventUid) {
  const res = useSelector(state => state.settings.apiRoot + state.res.eventContext.replace(':agendaUid', agendaUid).replace(':eventUid', eventUid));

  const {
    isLoading: eventContextIsLoading,
    data: eventContext
  } = useQuery('eventContext', () => axios.get(res).then(response => (response.data)));

  return {
    eventContextIsLoading,
    eventContext
  };
}
