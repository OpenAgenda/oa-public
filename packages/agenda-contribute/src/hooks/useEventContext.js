import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

export default function useEventContext(agendaUid, eventUid) {
  const res = useSelector(state => state.settings.apiRoot + state.res.eventContext.replace(':agendaUid', agendaUid).replace(':eventUid', eventUid));

  const {
    isLoading: eventContextIsLoading,
    data: eventContext,
  } = useQuery('eventContext', () => fetch(res)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Invalid status (${response.status})`);
      }
      return response.json();
    }));

  return {
    eventContextIsLoading,
    eventContext,
  };
}
