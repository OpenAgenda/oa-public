import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Canvas from '../components/Canvas';
import EventEditForm from '../components/EventEditForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import useEvent from '../hooks/useEvent';
import useDetailedAgenda from '../hooks/useDetailedAgenda';
import useEventFormConfig from '../hooks/useEventFormConfig';
import useAgendaContext from '../hooks/useAgendaContext';
import utils from '../lib/utils';
import getUneditableStandardFieldErrors from '../lib/getUneditableStandardFieldErrors';

import contributeReducer from '../reducers/contribute';

const {
  removeEventFieldsFromSchema
} = utils;

const messages = defineMessages({
  confirmShare: {
    id: 'AgendaContribute.EventShare.share',
    defaultMessage: 'Add the event'
  }
});

export default function EventAdd({
  agenda,
  history
}) {
  const m = useIntl().formatMessage;
  const apiRoot = useSelector(state => state.settings.apiRoot);
  const dispatch = useDispatch();

  const res = useSelector(state => state.res);

  const {
    eventUid,
    fromAgendaUid
  } = useParams();

  const {
    eventIsLoading,
    event,
    eventContext
  } = useEvent(fromAgendaUid, eventUid);

  const {
    detailedAgendaIsLoading: fromAgendaIsLoading,
    detailedAgenda: fromAgenda
  } = useDetailedAgenda(fromAgendaUid);

  const {
    detailedAgendaIsLoading,
    detailedAgenda
  } = useDetailedAgenda(agenda.uid);

  const {
    agendaContextIsLoading,
    agendaContext,
  } = useAgendaContext(agenda.uid);

  const {
    config,
    configIsLoading,
    schema
  } = useEventFormConfig(agenda);

  if (eventIsLoading || fromAgendaIsLoading || configIsLoading || agendaContextIsLoading || detailedAgendaIsLoading) {
    return <Loading />;
  }

  const errors = getUneditableStandardFieldErrors(detailedAgenda, event, eventContext);

  return (
    <Canvas
      mode="share"
      event={event}
      fromAgenda={fromAgenda}
      agenda={agenda}
    >
      {errors.length ? (
        <ErrorMessage
          event={event}
          agenda={detailedAgenda}
          onCancel={() => {
            dispatch(contributeReducer.goBackOrToEvent({ agenda: fromAgenda, event }));
          }}
          errors={errors}
          suggestChangeRes={
            res.suggestChangeRes
              .replace(':agendaSlug', fromAgenda.slug)
              .replace(':eventSlug', event.slug)
          }
        />
      ) : (
        <EventEditForm
          res={`${apiRoot}${history.location.pathname}`}
          config={{
            ...config,
            schema: eventContext.me?.authorizations?.canEditEvent ? schema : removeEventFieldsFromSchema(schema)
          }}
          memberRole={agendaContext.me.member.role}
          event={event}
          onSuccess={(_event, response) => {
            dispatch(contributeReducer.eventShareSuccess({
              fromAgenda,
              agenda,
              response
            }));
          }}
          saveButtonLabel={m(messages.confirmShare)}
        />
      )}
    </Canvas>
  );
}
