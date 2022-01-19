import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import EventEditForm from '../components/EventEditForm';
import Canvas from '../components/Canvas';
import Loading from '../components/Loading';
import useEvent from '../hooks/useEvent';
import useEventFormConfig from '../hooks/useEventFormConfig';

import contributeReducer from '../reducers/contribute';
import utils from '../lib/utils';
import usePrefix from '../hooks/usePrefix';
import RequestEditionRights from '../components/RequestEditionRights';

const {
  replaceWithStep,
  schemaWithoutEventFields,
  filterState
} = utils;

export default function EventEdit({
  agenda,
  history
}) {
  const {
    eventUid // as a string
  } = useParams();

  const location = useLocation();

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
    agendaContext,
    schema
  } = useEventFormConfig(agenda);

  useEffect(() => {
    if (!eventIsLoading && event.draft) {
      replaceWithStep(history, location, prefix, `event/${event.uid}/draft`);
    }
  }, [eventIsLoading, event, history, location, prefix]);

  if (eventIsLoading || isLoading) {
    return <Loading />;
  }

  return (
    <Canvas
      mode="edit"
      event={event}
    >
      {!eventContext.me.authorizations.canEditEvent ? (
        <div className="wsq padding-v-sm">
          <RequestEditionRights
            agenda={agenda}
            schema={schema}
            event={event}
          />
        </div>
      ) : null}
      <EventEditForm
        res={`${apiRoot}${location.pathname}`}
        config={{
          ...config,
          schema: eventContext.me?.authorizations?.canEditEvent ? schema : schemaWithoutEventFields(schema)
        }}
        event={filterState(agendaContext, event)}
        memberRole={agendaContext?.me?.member?.role}
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
