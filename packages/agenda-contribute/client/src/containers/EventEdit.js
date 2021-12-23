import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import EventEditForm from '../components/EventEditForm';
import Canvas from '../components/Canvas';
import Loading from '../components/Loading';
import useEvent from '../hooks/useEvent';
import useEventFormConfig from '../hooks/useEventFormConfig';

import contributeReducer from '../reducers/contribute';
import utils from '../lib/utils';
import usePrefix from '../hooks/usePrefix';

const {
  replaceWithStep
} = utils;

export default function EventEdit({
  agenda,
  history
}) {
  const {
    eventUid // as a string
  } = useParams();

  const prefix = usePrefix(agenda);
  const apiRoot = useSelector(state => state.settings.apiRoot);

  const dispatch = useDispatch();

  const {
    eventIsLoading,
    event,
    eventContext
  } = useEvent(agenda.uid, eventUid);

  const {
    config,
    isLoading,
    agendaContext
  } = useEventFormConfig(agenda);

  useEffect(() => {
    if (!eventIsLoading && event.draft) {
      replaceWithStep(history, prefix, `event/${event.uid}/draft`);
    }
  }, [eventIsLoading, event, history, prefix]);

  if (eventIsLoading || isLoading) {
    return <Loading />;
  }

  return (
    <Canvas
      mode="edit"
      event={event}
    >
      <EventEditForm
        res={`${apiRoot}${history.location.pathname}`}
        config={config}
        event={event}
        memberRole={agendaContext.me.member.role}
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
