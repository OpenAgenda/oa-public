import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import omit from 'lodash/omit.js';
import useEventContext from './useEventContext.js';
import cleanEditableData from './useCleanEditableData.js';

const validateStatus = (status) => (status >= 200 && status < 300) || 404;

export default function useEvent(agendaUid, eventUid, options = {}) {
  const { omitState = false } = options;

  const res = useSelector(
    (state) =>
      state.settings.apiRoot
      + state.res.event
        .replace(':agendaUid', agendaUid)
        .replace(':eventUid', eventUid),
  );

  const { isLoading: eventIsLoading, data: event } = useQuery(
    `agenda.${agendaUid}.event.${eventUid}`,
    () =>
      fetch(res)
        .then((response) => {
          if (!validateStatus(response.status)) {
            throw new Error(`Invalid status (${response.status})`);
          }
          return response.json();
        })
        .then((data) =>
          (data.event instanceof Object ? cleanEditableData(data.event) : null)),
    {
      staleTime: 1000,
    },
  );

  const { eventContextIsLoading, eventContext } = useEventContext(
    agendaUid,
    eventUid,
  );

  if (eventIsLoading || eventContextIsLoading) {
    return {
      eventIsLoading: true,
    };
  }

  if (!event) {
    return {
      eventIsLoading: false,
      event: null,
    };
  }

  return {
    eventIsLoading: false,
    event: omitState ? omit(event, ['state']) : event,
    eventContext,
  };
}
