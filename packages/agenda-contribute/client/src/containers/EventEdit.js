import React from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import EventEditForm from '../components/EventEditForm';
import Canvas from '../components/Canvas';
import Loading from '../components/Loading';
import useEventContext from '../hooks/useEventContext';
import useEvent from '../hooks/useEvent';
import useMember from '../hooks/useMember';
import useEventFormConfig from '../hooks/useEventFormConfig';

import contributeReducer from '../reducers/contribute';

export default function EventEdit({
  agenda,
  history
}) {
  const {
    eventUid // as a string
  } = useParams();
  const APIRoot = useSelector(state => state.APIRoot);

  const dispatch = useDispatch();

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
        res={`${APIRoot}${history.location.pathname}`}
        config={config}
        event={event}
        memberRole={member.role}
        canEditEvent={eventContext.me?.authorizations?.canEditEvent}
        onSuccess={(_event, response) => {
          dispatch(contributeReducer.eventUpdateSuccess({
            agenda,
            response
          }));
        }}
      />
    </Canvas>
  );
}
