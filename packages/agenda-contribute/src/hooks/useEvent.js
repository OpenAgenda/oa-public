import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

import useEventContext from './useEventContext';

const validateStatus = status => ([200, 404].includes(status));

export default function useEvent(agendaUid, eventUid) {
  const res = useSelector(state => state.settings.apiRoot + state.res.event.replace(':agendaUid', agendaUid).replace(':eventUid', eventUid));

  const {
    isLoading: eventIsLoading,
    data: event
  } = useQuery(`agenda.${agendaUid}.event.${eventUid}`, () => axios
    .get(res, { validateStatus })
    .then(response => (response.data instanceof Object ? response.data.event : null)),
  {
    staleTime: 1000
  });

  const {
    eventContextIsLoading,
    eventContext
  } = useEventContext(agendaUid, eventUid);

  if (eventIsLoading || eventContextIsLoading) {
    return {
      eventIsLoading: true
    };
  }

  if (!event) {
    return {
      eventIsLoading: false,
      event: null
    };
  }

  return {
    eventIsLoading: false,
    event,
    eventContext
  };
}
