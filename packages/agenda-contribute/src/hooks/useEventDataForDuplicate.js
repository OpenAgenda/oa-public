import debug from 'debug';
import axios from 'axios';
import qs from 'qs';

import { useLocation } from 'react-router';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

const log = debug('useEventDataForDuplicate');

function removeUnduplicatable(agenda, data) {
  if (!agenda) {
    return null;
  }

  const unduplicatableFields = [
    'agenda', 'slug', 'uid', 'fileKey', 'state', 'timings'
  ].concat(
    agenda.schema.fields
      .filter(f => !(f.duplicatable ?? true))
      .map(f => f.field)
  );

  return Object.keys(data)
    .filter(field => !unduplicatableFields.includes(field))
    .reduce((filtered, field) => Object.assign(filtered, {
      [field]: data[field]
    }), {});
}

export default function useEventDataForDuplicate() {
  const location = useLocation();

  const {
    eventUid,
    agendaUid
  } = qs.parse(location.search, { ignoreQueryPrefix: true });

  const res = useSelector(
    state => state.settings.apiRoot + state.res.event
      .replace(':agendaUid', agendaUid ?? 'none')
      .replace(':eventUid', eventUid ?? 'none')
  );
  const agendaRes = useSelector(
    state => state.settings.apiRoot + state.res.agenda.replace(':agendaUid', agendaUid ?? 'none')
  );

  const hasReferenceForDuplicate = agendaUid && eventUid;

  log(hasReferenceForDuplicate ? 'loading event and agenda for duplicate' : 'not a duplicate');

  const {
    isLoading: isReferenceLoading,
    data: referenceData
  } = useQuery(
    `duplicateFrom.${agendaUid ?? 'none'}.events.${eventUid ?? 'none'}`,
    () => axios.get(res).then(response => (response.data.event)),
    { enable: hasReferenceForDuplicate }
  );

  const {
    isLoading: isReferenceAgendaLoading,
    data: referenceAgenda
  } = useQuery(
    `duplicateFrom.${agendaUid ?? 'none'}`,
    () => axios.get(agendaRes).then(response => (response.data)),
    { enable: hasReferenceForDuplicate }
  );

  return useMemo(() => ({
    hasReferenceForDuplicate,
    isReferenceLoading: isReferenceLoading || isReferenceAgendaLoading,
    referenceData: referenceAgenda && referenceData ? removeUnduplicatable(referenceAgenda, referenceData) : null,
  }), [hasReferenceForDuplicate, isReferenceLoading, referenceData, isReferenceAgendaLoading, referenceAgenda]);
}
