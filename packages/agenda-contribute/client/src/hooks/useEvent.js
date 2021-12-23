import _ from 'lodash';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';

import useEventContext from './useEventContext';

export default function useEvent(agendaUid, eventUid) {
  const res = useSelector(state => state.settings.apiRoot + state.res.event.replace(':agendaUid', agendaUid).replace(':eventUid', eventUid));

  const {
    isLoading: eventIsLoading,
    data: event
  } = useQuery('event', () => axios.get(res).then(response => (response.data.event)));

  const {
    eventContextIsLoading,
    eventContext
  } = useEventContext(agendaUid, eventUid);

  if (eventIsLoading || eventContextIsLoading) {
    return {
      eventIsLoading: true
    };
  }

  const {
    canChangeState
  } = eventContext.me.authorizations;

  return {
    eventIsLoading: false,
    event: canChangeState ? event : _.omit(event, ['state']),
    eventContext
  };
}
