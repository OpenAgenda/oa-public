import React from 'react';
import { useParams } from 'react-router-dom';

import useEventContext from '../lib/useEventContext';
import useEvent from '../lib/useEvent';

export default function EventEdit({
  agenda
}) {
  const {
    eventUid // as a string
  } = useParams();

  const {
    eventContextIsLoading,
    eventContext
  } = useEventContext(agenda.uid, eventUid);

  const isEventContributor = eventContext.me?.member?.userUid === eventContext.member?.userUid;
  const canEditEvent = eventContext.me?.authorizations?.canEditEvent;

  const {
    eventIsLoading,
    event
  } = useEvent(agenda.uid, eventUid);

  return (
    <div>
      Bim
    </div>
  );
}

// ?detailed=1&useDateHoursMinutesFormat=1
