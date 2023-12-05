import debug from 'debug';
import axios from 'axios';
import qs from 'qs';

import { useLocation } from 'react-router';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import utils from '../lib/utils';

const {
  removeUnduplicatable,
} = utils;

const log = debug('useEventDataForDuplicate');

export default function useEventDataForDuplicate(destinationAgenda) {
  const location = useLocation();

  const {
    eventUid,
    agendaUid,
  } = qs.parse(location.search, { ignoreQueryPrefix: true });

  const res = useSelector(
    state => state.settings.apiRoot + state.res.event
      .replace(':agendaUid', agendaUid ?? 'none')
      .replace(':eventUid', eventUid ?? 'none'),
  );
  const agendaRes = useSelector(
    state => state.settings.apiRoot + state.res.agenda.replace(':agendaUid', agendaUid ?? 'none'),
  );

  const hasReferenceForDuplicate = agendaUid && eventUid;

  log(hasReferenceForDuplicate ? 'loading event and agenda for duplicate' : 'not a duplicate');

  const {
    isLoading: isReferenceLoading,
    data: referenceData,
  } = useQuery(
    `duplicateFrom.${agendaUid ?? 'none'}.events.${eventUid ?? 'none'}`,
    () => axios.get(res).then(response => response.data.event),
    { enabled: !!hasReferenceForDuplicate },
  );

  const {
    isLoading: isReferenceAgendaLoading,
    data: referenceAgenda,
  } = useQuery(
    `duplicateFrom.${agendaUid ?? 'none'}`,
    () => axios.get(agendaRes).then(response => response.data),
    { enabled: !!hasReferenceForDuplicate },
  );

  return useMemo(() => ({
    hasReferenceForDuplicate,
    isReferenceLoading: isReferenceLoading || isReferenceAgendaLoading,
    referenceData: referenceAgenda && referenceData ? removeUnduplicatable(destinationAgenda, referenceAgenda, referenceData) : null,
    duplicateOrigin: {
      agendaUid,
      eventUid,
    },
  }), [hasReferenceForDuplicate, isReferenceLoading, referenceData, isReferenceAgendaLoading, referenceAgenda, destinationAgenda, agendaUid, eventUid]);
}
