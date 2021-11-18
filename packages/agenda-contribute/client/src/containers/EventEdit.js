import React from 'react';
import { useParams } from 'react-router-dom';

import EventEditForm from '../components/EventEditForm';
import Canvas from '../components/Canvas';
import Loading from '../components/Loading';
import useEventContext from '../hooks/useEventContext';
import useEvent from '../hooks/useEvent';
import useMember from '../hooks/useMember';
import useEventFormConfig from '../hooks/useEventFormConfig';

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

  const {
    eventIsLoading,
    event
  } = useEvent(agenda.uid, eventUid);

  const {
    memberIsLoading,
    member
  } = useMember(agenda);

  const {
    config,
    configIsLoading
  } = useEventFormConfig(agenda);

  if (eventContextIsLoading || eventIsLoading || memberIsLoading || configIsLoading) {
    return <Loading />;
  }

  return (
    <Canvas
      mode="edit"
      event={event}
    >
      <EventEditForm
        config={config}
        event={event}
        memberRole={member.role}
        canEditEvent={eventContext.me?.authorizations?.canEditEvent}
      />
    </Canvas>
  );
}
